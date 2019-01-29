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

export default class BreaksDrawer extends Component{
  constructor(props){
    super(props)
    let breaks = JSON.parse(JSON.stringify(props.breaks))
    let newBreak = {}

    // if there are any breaks...
    if(breaks.length){
      // set the default value of newBreak
      newBreak.startTime = TimeCalc.add(breaks[breaks.length - 1].endTime, 90)
      newBreak.endTime = TimeCalc.add(newBreak.startTime, 30)
    }

    // if there aren't any, set the default value
    else{
      newBreak.startTime = TimeCalc.round(TimeCalc.add(props.currentTime, 90), 15)
      newBreak.endTime = TimeCalc.add(newBreak.startTime, 30)
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

  handleInputChange(breakId, propertyId, e){
    let val = e.target.value

    if(breakId === "new"){
      let newBreak = this.state.newBreak
      newBreak[propertyId] = val
      this.setState({newBreak})
    }
    else{
      let breaks = this.state.breaks
      let index = breaks.findIndex(el => el.id === breakId)
      breaks[index][propertyId] = val

      this.setState({breaks})
      this.props.onSave(breaks)
    }
  }

  validateEndTime = (breakId, startTime, endTime) => {
    let temp = this.state.temp
    let showEndTimeErrors = this.state.showEndTimeErrors

    let success

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

  handleTimeInputChange(breakId, propertyId, inputId, val){
    if(breakId === "new"){
      let newBreak = this.state.newBreak
      let breakDurations = this.state.breakDurations

      newBreak[propertyId][inputId] = val

      if(val !== ""){
        if(propertyId === "startTime"){
          newBreak.endTime = TimeCalc.add(newBreak.startTime, breakDurations.new)
        }

        if(propertyId === "endTime"){
          this.validateEndTime(breakId, newBreak.startTime, newBreak.endTime)

          breakDurations.new = TimeCalc.subtractToMinutes(newBreak.endTime, newBreak.startTime, true)
        }
      }

      this.setState({newBreak, breakDurations})
    }

    else{
      let breaks = this.state.breaks
      let breakDurations = this.state.breakDurations
      let index = breaks.findIndex(el => el.id === breakId)
      breaks[index][propertyId][inputId] = val /// SOMEHOW CHANGES THIS.PROPS.BREAKS

      let success = true

      if(val === "") success = false
      else {
        if(propertyId === "startTime"){
          breaks[index].endTime = TimeCalc.add(breaks[index].startTime, breakDurations[breakId])
        }

        if(propertyId === "endTime"){
          success = this.validateEndTime(breakId, breaks[index].startTime, breaks[index].endTime)

          breakDurations[index] = TimeCalc.subtractToMinutes(breaks[index].endTime, breaks[index].startTime, true)
          this.setState({breakDurations})
        }
      }

      let errors = this.state.errors
      errors[breakId] = !success
      let canClose = Object.values(errors).every(x => !x)

      this.setState({breaks, errors})
      this.props.onSave(breaks, canClose)
    }
  }

  addBreak = () => {
    if(this.state.showEndTimeErrors.new) return

    let breaks = this.state.breaks
    let newBreak = this.state.newBreak

    // assign an id one bigger than the current biggest one
    let highestId = -1
    for(let i = 0; i < breaks.length; i++) if(breaks[i].id > highestId) highestId = breaks[i].id
    let newId = highestId + 1

    newBreak.id = newId

    breaks.push(newBreak)

    this.setState({breaks})
    this.props.onSave(breaks)

    let breakDurations = this.state.breakDurations
    breakDurations.new = 30
    breakDurations[newId] = TimeCalc.subtractToMinutes(newBreak.endTime, newBreak.startTime, true)

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

    let errors = this.state.errors
    delete errors[id]
    let canClose = Object.values(errors).every(x => !x)

    this.setState({breaks, errors})
    this.props.onSave(breaks, canClose)
  }

  handleSave = () => {
    this.props.onClose()
  }

  handleEnterPress = e => {
    if(e.key === "Enter") this.addBreak()
  }

  handleEnterPressNew = e => {
    if(e.key === "Enter") this.addBreak()
  }


  render(){
    let rows = this.state.breaks.map((breakInfo, i) => {
      return (
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
      )
    })

    return (
      <React.Fragment>
        <Typography variant="h6">Breaks:</Typography>
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
            {rows.length ? rows : (
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
}
