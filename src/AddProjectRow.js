import React, { Component } from 'react';
import ColorPicker from './ColorPicker'
import SetStartTimeCell from './SetStartTimeCell'
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Input from '@material-ui/core/Input';
import AddIcon from '@material-ui/icons/Add';
import IconButton from '@material-ui/core/IconButton';
import TimeCalc from './util/TimeCalc'
import { projectValidation, inputValidation } from './util/validation'

export default class AddProjectRow extends Component {
  constructor(props){
    super(props)

    let color
    if(typeof this.props.defaultColorIndex !== "undefined"){
      color = this.props.settings.defaultColors[this.props.defaultColorIndex]
    }
    else color = "#000000"

    this.state = {
      inputValues: {
        name: "",
        duration: "",
        startTime: {h: "", m: "", pm: true},
        color
      },
      userHasntChangedStartTime: true,
      defaultColorIndex: this.props.defaultColorIndex,
      showErrors: {}
    }
  }

  componentDidUpdate(){
    // if the user hasn't changed startTime yet, suggest a new startTime
    // (don't execute if the props haven't loaded yet)
    if(
      this.state.userHasntChangedStartTime &&
      this.props.settings.bufferTimePercentage &&
      this.props.lastProject &&
      !this.props.dontShowTime
    ){
      let suggestedStartTime = TimeCalc.suggestStartTime(
        this.props.lastProject.plannedTime.end,
        this.props.lastProject.estimatedDuration,
        this.props.settings
      )
      if(
        this.state.inputValues.startTime.h === "" ||
        !TimeCalc.areIdentical(suggestedStartTime, this.state.inputValues.startTime)
      ){
        this.setState(
          {
            inputValues: {
            ...this.state.inputValues,
              startTime: suggestedStartTime
            }
          }
        )
      }
    }

    // only used if defaultColorIndex (and startTime) are being initialized with data from the localStorage
    if(typeof this.state.defaultColorIndex === "undefined"
      && typeof this.props.defaultColorIndex !== "undefined"
      && this.props.settings.defaultColors
    ){

      let inputValues = this.state.inputValues

      let defaultColors = this.props.settings.defaultColors
      let defaultColorIndex = this.props.defaultColorIndex

      // handle the following: defaultColorsIndex is at max and the user deletes the last defaultColor in the settings
      if(defaultColors.length <= defaultColorIndex) defaultColorIndex = 0

      inputValues.color = defaultColors[defaultColorIndex]

      // handle undefined
      inputValues.color = inputValues.color ? inputValues.color : "#000000"

      this.setState({inputValues, defaultColorIndex})
    }
  }

  handleInputChange(el, e){
    let val = e.target.value
    // validation
    if(!inputValidation(el, val)) return

    let newState = {inputValues: this.state.inputValues, showErrors: this.state.showErrors}
    newState.inputValues[el] = val
    newState.showErrors[el] = false
    this.setState(newState)
  }

  handleColorChange(val){
    let newState = this.state.inputValues
    newState.color = val
    this.setState({inputValues: newState})
  }

  handleStartTimeChange(id, val){
    let newState = {inputValues: this.state.inputValues, showErrors: this.state.showErrors}

    if(id === "object") newState.inputValues.startTime = val
    else newState.inputValues.startTime[id] = val

    newState.showErrors["startTime" + id.toUpperCase()] = false
    newState.userHasntChangedStartTime = false
    this.setState(newState)
  }

  handleAddProject = () => {
    // validation
    let validation = projectValidation(this.state.inputValues, this.props.dontShowTime)
    if(!validation.valid){
      let newState = this.state.showErrors
      validation.errors.forEach(error => {
        newState[error] = true
      })
      this.setState(newState)
      return
    }

    // reset the state
    let newState = {
      name: "",
      duration: "",
      startTime: {
        h: "",
        m: "",
        pm: true
      },
      color: this.state.inputValues.color // perserve the color
    }

    // if the user hasn't changed the color from the default, go to the next defaultColor
    let defaultColors = this.props.settings.defaultColors
    let defaultColorIndex = this.state.defaultColorIndex

    let newDefaultColorIndex = defaultColorIndex >= defaultColors.length - 1 ? 0 : ++defaultColorIndex

    newState.color = defaultColors[newDefaultColorIndex]

    // call the props function
    this.props.onAddProject(this.state.inputValues, newDefaultColorIndex)

    // save to state
    this.setState({inputValues: newState, userHasntChangedStartTime: true, defaultColorIndex: newDefaultColorIndex})
  }

  handleEnterPress = e => {if(e.key === "Enter") this.handleAddProject()}

  render(){
    let showErrorProp = this.props.showErrors.noProjects

    return (
      <TableRow id="addProjectRow">
        <TableCell>
          <ColorPicker
            value={this.state.inputValues.color}
            onChange={this.handleColorChange.bind(this)} />
        </TableCell>
        <TableCell className="setNameCell">
          <div id="addProjectLabelDiv">
            <label htmlFor="addProjectNameInput">
              Add a project:
            </label>
          </div>
          <Input
            onChange={this.handleInputChange.bind(this, "name")}
            value={this.state.inputValues["name"]}
            placeholder="Name"
            aria-label="Name"
            error={this.state.showErrors.name || showErrorProp}
            onKeyPress={this.handleEnterPress}
            id="addProjectNameInput"
            autoFocus
          />
        </TableCell>
        <TableCell className="setDurationCell">
          <Input
            onChange={this.handleInputChange.bind(this, "duration")}
            value={this.state.inputValues["duration"]}
            placeholder="Duration"
            aria-label="Duration"
            error={this.state.showErrors.duration || showErrorProp}
            onKeyPress={this.handleEnterPress}
          /> minutes
        </TableCell>
        {!this.props.dontShowTime && (
          <SetStartTimeCell
            onChange={this.handleStartTimeChange.bind(this)}
            value={this.state.inputValues.startTime}
            firstInputId="setStartTimeInput"
            hError={this.state.showErrors.startTimeH || showErrorProp}
            mError={this.state.showErrors.startTimeM || showErrorProp}
            showErrors={this.state.showErrors}
            onEnterPress={this.handleAddProject}
          />
        )}
        <TableCell>
          <IconButton color="primary"
            style={{color: this.props.showErrors.noProjects ? "red" : null}}
            aria-label="Add the new project"
            onClick={this.handleAddProject}>
            <AddIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    )
  }
}
