import React, { Component } from 'react';
import ColorPicker from './ColorPicker'
import SetStartTimeCell from './SetStartTimeCell'
import ChangeProjectStateCell from './ChangeProjectStateCell'
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import RootRef from '@material-ui/core/RootRef';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import Tooltip from '@material-ui/core/Tooltip';
import TimeCalc from './util/TimeCalc'
import EditIcon from '@material-ui/icons/Edit';
import DoneIcon from '@material-ui/icons/Done';
import DeleteIcon from '@material-ui/icons/Delete';
import { projectValidation, inputValidation } from './util/validation'
import { SettingsContext } from './_Context'

export default class ProjectsTableRow extends Component {
  constructor(props){
    super(props)
    this.state = {
      editing: false,
      values: {
        name: this.props.row.name,
        duration: this.props.row.estimatedDuration,
        startTime: this.props.row.plannedTime.start
      },
      showErrors: {}
    }
  }

  handleStartEditing(){
    this.setState({
      editing: true,
      // get the startTime from props again in case it changed via drag n drop
      values: {
        ...this.state.values,
        startTime: Object.assign({}, this.props.row.plannedTime.start)
      }
    })
  }

  handleInputChange(id, e){
    let val = e.target.value
    // validation
    if(!inputValidation(id, val)) return

    let newState = {values: this.state.values, showErrors: this.state.showErrors}
    newState.values[id] = val
    newState.showErrors[id] = false
    this.setState(newState)
  }

  handleStartTimeChange(id, val){
    let newState = {values: this.state.values, showErrors: this.state.showErrors}

    if(id === "object") newState.values.startTime = val
    else newState.values.startTime[id] = val

    newState.showErrors["startTime" + id.toUpperCase()] = false
    this.setState(newState)
  }

  handleDoneEditing = () => {
    // validation
    let validation = projectValidation(this.state.values, this.props.dontShowTime)
    if(!validation.valid){
      let newState = this.state.showErrors
      validation.errors.forEach(error => {
        newState[error] = true
      })
      this.setState(newState)
      return
    }

    this.props.onDoneEditing(this.props.row.id, this.state.values)
    this.setState({editing: false})
  }

  handleEnterPress = e => {if(e.key === "Enter") this.handleDoneEditing()}

  render(){
    let showEditing = this.state.editing && this.props.mode === "planning"

    let progress, stateClass, startIsTooLate, endIsTooLate, timeLeft
    if(!this.props.dontCalculateState){
      // calculate progress
      if(this.props.row.progress) progress = parseInt(this.props.row.progress)
      else progress = 0
      if(this.props.row.state === "workingOnIt"){
        progress += TimeCalc.subtractToMinutes(this.props.currentTime, this.props.row.startedWorkingOnIt, true)
      }

      let progressCapped = progress // same as progress except capped at estimatedDuration
      if(progressCapped > this.props.row.estimatedDuration) progressCapped = this.props.row.estimatedDuration

      timeLeft = parseInt(this.props.row.estimatedDuration) - progressCapped

      // get the stateClass - done, too late
      startIsTooLate = !TimeCalc.isBiggerThan(
        TimeCalc.add(this.props.row.plannedTime.start, progressCapped),
        this.props.currentTime, true, true)
      endIsTooLate = !TimeCalc.isBiggerThan(this.props.row.plannedTime.end, this.props.currentTime, true, true)
      if(this.props.row.state === "done") stateClass = "stateClassDone"
      else if(startIsTooLate && this.props.row.state !== "workingOnIt") stateClass = "stateClassTooLate"
    }

    return (
      <RootRef rootRef={this.props.provided.innerRef}>
        <TableRow {...this.props.provided.draggableProps}>
          <TableCell>
            <Icon className="dragIcon" {...this.props.provided.dragHandleProps}>drag_indicator</Icon>
            <ColorPicker value={this.props.row.color} onChange={this.props.onColorChange.bind(this, this.props.row.id)}/>
          </TableCell>

          <TableCell className={showEditing ? "setNameCell" : stateClass}>
            {showEditing ? (
              <Input
                value={this.state.values.name}
                onChange={this.handleInputChange.bind(this, "name")}
                placeholder="Name"
                aria-label="Name"
                error={this.state.showErrors.name}
                onKeyPress={this.handleEnterPress}
              />
            ) : this.props.row.name}
          </TableCell>

          <TableCell className={showEditing ? "setDurationCell" : null}>
            {showEditing ? (
              <Input
                value={this.state.values.duration}
                onChange={this.handleInputChange.bind(this, "duration")}
                placeholder="Duration"
                aria-label="Duration"
                error={this.state.showErrors.duration}
                onKeyPress={this.handleEnterPress}
              />
            ) : (
              progress && this.props.row.state !== "done" ? (
                <Tooltip title={progress + "/" + this.props.row.estimatedDuration + " done"}>
                  <span>
                    {timeLeft} minutes left
                  </span>
                </Tooltip>
              ) : (
                this.props.row.estimatedDuration + " minutes"
              )
            )}
          </TableCell>

          {!this.props.dontShowTime && (showEditing ? (
            <SetStartTimeCell
              value={this.state.values.startTime}
              onChange={this.handleStartTimeChange.bind(this)}
              firstInputId={"changeStartTimeInput" + this.props.row.id}
              hError={this.state.showErrors.startTimeH}
              mError={this.state.showErrors.startTimeM}
              onEnterPress={this.handleDoneEditing}
            />
          ) : (
            <SettingsContext.Consumer>
              {settings => (
                <TableCell className={showEditing ? "setStartTimeCell" : null}>
                  <span className={startIsTooLate && stateClass === "stateClassTooLate"  ? stateClass : null}>
                    {TimeCalc.makeString(this.props.row.plannedTime.start,
                      this.props.row.plannedTime.start.pm !== this.props.row.plannedTime.end.pm,
                      true,
                      settings.timeFormat24H
                    ) /*showPmOrAm only if it's different from the endTime*/}
                  </span>
                  <span className={startIsTooLate && endIsTooLate && stateClass === "stateClassTooLate" ? stateClass : null}>
                    -
                  </span>
                  <span className={endIsTooLate && stateClass !== "stateClassDone" ? "stateClassTooLate" : null}>
                    {TimeCalc.makeString(this.props.row.plannedTime.end, true, false, settings.timeFormat24H)}
                  </span>
                </TableCell>
              )}
            </SettingsContext.Consumer>
          ))}

          {this.props.mode === "planning" ? (
            <TableCell>
              {showEditing ? (
                <IconButton
                  aria-label="Save changes"
                  onClick={this.handleDoneEditing}
                  color="primary">
                  <DoneIcon />
                </IconButton>
              ) : (
                <IconButton
                  aria-label="Edit the project"
                  onClick={this.handleStartEditing.bind(this)}>
                  <EditIcon />
                </IconButton>
              )}
              <IconButton
                aria-label="Delete the project"
                onClick={this.props.onDeleteProject.bind(this, this.props.row.id)}
                className="deleteIconButton">
                <DeleteIcon />
              </IconButton>
            </TableCell>
          ) : (
            <ChangeProjectStateCell
              row={this.props.row}
              onProjectStateChange={this.props.onProjectStateChange}
              currentTime={this.props.currentTime}
            />
          )}
        </TableRow>
      </RootRef>
    )
  }
}
