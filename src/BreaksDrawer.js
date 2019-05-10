import React, { Component } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import TimeSetter from './TimeSetter'
import TimeCalc from './util/TimeCalc'
import makeNewId from './util/makeNewId'
import validationRegex from './util/validationRegex'
import './css/BreaksDrawer.css'

export default class BreaksDrawer extends Component{
  constructor(props){
    super(props)
    // put some props into the state
    let breaks = JSON.parse(JSON.stringify(props.breaks))
    let newBreak = {}

    // if there are any breaks...
    if(breaks.length){
      // set the default value of newBreak
      newBreak.startTime = TimeCalc.add(breaks[breaks.length - 1].endTime, 90)
      newBreak.endTime = TimeCalc.add(newBreak.startTime, 60)
    }

    // if there aren't any, set the default value
    else{
      newBreak.startTime = TimeCalc.round(TimeCalc.add(props.currentTime, 90), 15)
      newBreak.endTime = TimeCalc.add(newBreak.startTime, 60)
    }

    newBreak.name = ""

    // store the length of breaks
    let breakDurations = {
      new: 30
    }
    for(let i = 0; i < breaks.length; i++){
      let breakId = breaks[i].id
      breakDurations[breakId] = TimeCalc.subtractToMinutes(breaks[i].endTime, breaks[i].startTime, true)
    }

    this.state = {
      breaks,
      newBreak,
      breakDurations,
      errors: {},
      showEndTimeErrors: {},
      temp: {
        showEndTimeErrors: {}
      }
    }
  }

  // used for simple text input editing (not the start or end times)
  handleInputChange(breakId, propertyId, e){
    let val = e.target.value

    if(validationRegex.test(val)) return // these characters could be problematic in the stringified JSON

    if(breakId === "new"){ // "new" means the input fields of the last row that is used to add new breaks
      let newBreak = this.state.newBreak
      newBreak[propertyId] = val
      this.setState({newBreak})
    }
    else{
      let breaks = this.state.breaks
      let index = breaks.findIndex(el => el.id === breakId)
      breaks[index][propertyId] = val

      this.setState({breaks})
      this.props.onSave(breaks, {breaks: breakId})
    }
  }

  validateEndTime = (breakId, startTime, endTime) => {
    let temp = this.state.temp
    let showEndTimeErrors = this.state.showEndTimeErrors

    let success

    // endTime needs to be after startTime, if it isn't show an error
    // (show the error after a timeout to prevent flashing errors as the user types)
    if(!TimeCalc.isBiggerThan(endTime, startTime, false, true)){
      success = false

      temp.showEndTimeErrors[breakId] = setTimeout(() => {
        this.setState({
          showEndTimeErrors: {
            ...this.state.showEndTimeErrors,
            [breakId]: true
          }
        })
      }, 500)
    }
    else{
      success = true

      showEndTimeErrors[breakId] = false
      clearTimeout(temp.showEndTimeErrors[breakId])
    }

    this.setState({temp, showEndTimeErrors})
    return success
  }

  // when the user edits the startTime/endTime
  handleTimeInputChange(breakId, propertyId, inputId, val){
    if(validationRegex.test(val)) return

    if(breakId === "new"){ // see above
      let newBreak = this.state.newBreak
      let breakDurations = this.state.breakDurations

      // inputId can either be a single field (eg. minutes) or the whole time object
      if(inputId === "object") newBreak[propertyId] = val
      else newBreak[propertyId][inputId] = val

      if(val !== ""){
        // if the user edits the startTime, adjust endTime accordingly
        if(propertyId === "startTime"){
          newBreak.endTime = TimeCalc.add(newBreak.startTime, breakDurations.new)
        }

        if(propertyId === "endTime"){
          this.validateEndTime(breakId, newBreak.startTime, newBreak.endTime)

          // changing the endTime also changes the duration, the state needs to reflect that
          breakDurations.new = TimeCalc.subtractToMinutes(newBreak.endTime, newBreak.startTime, true)
        }
      }

      this.setState({newBreak, breakDurations})
    }

    else{
      let breaks = this.state.breaks
      let breakDurations = this.state.breakDurations
      let index = breaks.findIndex(el => el.id === breakId)

      // accept both a single input (eg. minutes) or an entirely new time object
      if(inputId === "object") breaks[index][propertyId] = val
      else breaks[index][propertyId][inputId] = val

      let success = true

      if(val === "") success = false // an empty string is not a valid time value for an existing break
      else {
        // if the user changes the startTime, adjust the endTime too
        if(propertyId === "startTime"){
          breaks[index].endTime = TimeCalc.add(breaks[index].startTime, breakDurations[breakId])
        }

        if(propertyId === "endTime"){
          success = this.validateEndTime(breakId, breaks[index].startTime, breaks[index].endTime)

          // breakDurations need to be updated if the endTime is changed
          breakDurations[index] = TimeCalc.subtractToMinutes(breaks[index].endTime, breaks[index].startTime, true)
          this.setState({breakDurations})
        }
      }

      // check if there were any errors
      let errors = this.state.errors
      errors[breakId] = !success
      let canClose = Object.values(errors).every(x => !x)

      this.setState({breaks, errors})
      this.props.onSave(breaks, canClose, {breaks: breakId})
    }
  }

  // add a new break
  addBreak = () => {
    // if there is an error coming from input validation, the user has to fix it first
    if(this.state.showEndTimeErrors.new) return

    let breaks = this.state.breaks
    let newBreak = this.state.newBreak

    // make a new unique ID
    let newId = makeNewId(breaks, "breaks")
    newBreak.id = newId

    breaks.push(newBreak)

    this.setState({breaks})
    this.props.onSave(breaks, {breaks: newId})

    // adjust breakDurations to reflect the changes
    let breakDurations = this.state.breakDurations
    breakDurations.new = 30
    breakDurations[newId] = TimeCalc.subtractToMinutes(newBreak.endTime, newBreak.startTime, true)

    // store new init values for the newBreak input fields
    this.setState({
      newBreak: {
        startTime: TimeCalc.add(newBreak.endTime, 90),
        endTime: TimeCalc.add(newBreak.endTime, 120),
        name: ""
      },
      breakDurations
    })
  }

  deleteBreak(id){
    let breaks = this.state.breaks
    let index = breaks.findIndex(el => el.id === id)
    breaks.splice(index, 1)

    // when the break is deleted, there's no reason to store any errors that might've been associated with it
    let errors = this.state.errors
    delete errors[id]
    let canClose = Object.values(errors).every(x => !x)

    this.setState({breaks, errors})
    this.props.onSave(breaks, canClose, {breaks: id})
  }

  handleSave = () => {
    this.props.onClose()
  }

  handleEnterPress = e => {
    if(e.key === "Enter") this.addBreak()
  }

  handleEnterPressNew = e => { // "new" -> when adding a new break
    if(e.key === "Enter") this.addBreak()
  }

  render = () => (
    <React.Fragment>
      <Typography variant="h6" className="drawerTitle">
        Breaks:
      </Typography>
      <Table className="BreaksDrawer">
        <TableHead>
          <TableRow>
            <TableCell>Name (optional)</TableCell>
            <TableCell>Start</TableCell>
            <TableCell>End</TableCell>
            <TableCell/>
          </TableRow>
        </TableHead>
        <TableBody>
          {this.state.breaks.length ? (
            this.state.breaks.map((breakInfo, i) => (
              <TableRow key={breakInfo.id}>
                <TableCell>
                  <Input
                    value={breakInfo.name}
                    onChange={this.handleInputChange.bind(this, breakInfo.id, "name")}
                    onKeyPress={this.handleEnterPress}
                  />
                </TableCell>
                <TableCell>
                  <TimeSetter
                    value={breakInfo.startTime}
                    onChange={this.handleTimeInputChange.bind(this, breakInfo.id, "startTime")}
                    onEnterPress={this.handleSave}
                  />
                </TableCell>
                <TableCell>
                  <TimeSetter
                    value={breakInfo.endTime}
                    onChange={this.handleTimeInputChange.bind(this, breakInfo.id, "endTime")}
                    onEnterPress={this.handleSave}
                    showError={this.state.showEndTimeErrors[breakInfo.id]}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={this.deleteBreak.bind(this, breakInfo.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4}>You haven't set any breaks</TableCell>
            </TableRow>
          )}
          <TableRow>
            <TableCell>
              <Input
                value={this.state.newBreak.name}
                onChange={this.handleInputChange.bind(this, "new", "name")}
                onKeyPress={this.handleEnterPressNew}
              />
            </TableCell>
            <TableCell>
              <TimeSetter
                value={this.state.newBreak.startTime}
                onChange={this.handleTimeInputChange.bind(this, "new", "startTime")}
                onEnterPress={this.addBreak}
              />
            </TableCell>
            <TableCell>
              <TimeSetter
                value={this.state.newBreak.endTime}
                onChange={this.handleTimeInputChange.bind(this, "new", "endTime")}
                onEnterPress={this.addBreak}
                showError={this.state.showEndTimeErrors.new}
              />
            </TableCell>
            <TableCell>
              <IconButton color="primary" onClick={this.addBreak}>
                <AddIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Grid container justify="center">
        <Button
          onClick={this.handleSave.bind(this)}
          variant="contained"
          color="primary"
          style={{margin: ".5rem"}}>
          Save
        </Button>
      </Grid>
    </React.Fragment>
  )
}
