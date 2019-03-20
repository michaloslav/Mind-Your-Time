import React, { Component } from 'react'
import TimeCalc from '../util/TimeCalc'
import { inputValidation } from '../util/validation'

const withInputFields = WrappedComponent => (
  class withInputFields extends Component{
    constructor(props){
      super(props)

      // see if the inputValues are already supplied, if not, set them
      let inputValues
      if(this.props.inputValues){
        inputValues = this.props.inputValues
      }

      else{
        inputValues = {name: ""}

        let { type } = this.props

        let roundTo = this.props.settings.roundTo || 5

        if(type !== "default"){
          // set a default startTime value
          // first try to set a value based on lastProject
          let startTime
          let lastProject = this.props.lastProject
          if(lastProject && lastProject.plannedTime){
            startTime = TimeCalc.suggestStartTime(
              lastProject.plannedTime.end,
              lastProject.estimatedDuration,
              this.props.settings
            )
          }
          else{
            // then try a value based on currentTime
            if(this.props.currentTime){
              startTime = TimeCalc.round(TimeCalc.add(this.props.currentTime, 15), roundTo)
            }
            else startTime = {h: 12, m: 0, pm: true}
          }

          inputValues.startTime = startTime
        }

        if(this.props.type === "break"){
          inputValues.endTime = TimeCalc.round(TimeCalc.add(inputValues.startTime, 30), roundTo)
        }
        else{
          inputValues.duration = ""

          let color
          if(typeof this.props.defaultColorIndex !== "undefined"){
            color = this.props.settings.defaultColors[this.props.defaultColorIndex]
          }
          else color = "#000000"

          inputValues.color = color
        }
      }

      this.state = {
        inputValues,
        userHasntChangedStartTime: true,
        defaultColorIndex: this.props.defaultColorIndex,
        showErrors: {}
      }
    }

    componentDidUpdate(){
      // if the user hasn't changed startTime yet, suggest a new startTime
      // (don't execute if the props haven't loaded yet)
      if(
        this.props.type !== "default" &&
        this.state.inputValues.h !== "" &&
        this.state.userHasntChangedStartTime &&
        this.props.settings.bufferTimePercentage &&
        this.props.lastProject &&
        !this.props.isDefaultProjects
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
          let inputValues = {...this.state.inputValues, startTime: suggestedStartTime}
          if(this.props.type === "break"){
            let suggestedEndTime = TimeCalc.round(TimeCalc.add(suggestedStartTime, 30), this.props.settings.roundTo)
            inputValues.endTime = suggestedEndTime
          }
          this.setState({inputValues})
        }
      }

      // only used if defaultColorIndex (and startTime) are being initialized with data from the localStorage
      if(
        this.props.type !== "break" &&
        !this.props.inputValues &&
        typeof this.state.defaultColorIndex === "undefined" &&
        typeof this.props.defaultColorIndex !== "undefined" &&
        this.props.settings.defaultColors
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

    handleInputChange(id, e){
      let val = e.target.value
      if(!inputValidation(id, val)) return
      this.setState({
        inputValues: {...this.state.inputValues, [id]: val},
        showErrors: {...this.state.showErrors, [id]: false}
      })
    }

    handleTimeInputChange(inputId, id, val){
      let newState = {inputValues: this.state.inputValues, showErrors: this.state.showErrors}

      if(id === "object") newState.inputValues[inputId] = val
      else newState.inputValues[inputId][id] = val

      newState.showErrors[inputId + id.toUpperCase()] = false
      newState.userHasntChangedStartTime = false

      this.setState(newState)
    }

    handleColorChange = val => {
      this.setState({inputValues: {...this.state.inputValues, color: val}})
    }

    render = () => (
      <WrappedComponent
        {...this.props}
        inputValues={this.state.inputValues}
        showErrors={this.state.showErrors}
        showErrorProp={this.props.showErrors ? this.props.showErrors.noProjects : false}
        onInputChange={this.handleInputChange.bind(this)}
        onTimeInputChange={this.handleTimeInputChange.bind(this)}
        onColorChange={this.handleColorChange}
        setState={this.setState.bind(this)}
      />
    )
  }
)

export default withInputFields
