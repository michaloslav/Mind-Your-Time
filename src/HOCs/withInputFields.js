import React, { Component } from 'react'
import TimeCalc from '../util/TimeCalc'
import DefaultProjectsDaysDialog from '../DefaultProjectsDaysDialog'
import Dialog from '@material-ui/core/Dialog';
import { inputValidation } from '../util/validation'

// used as an HOC for the withAdd and withEdit HOCs to add common functionality (mostly editing and validating fields)
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
        // default state depends on the type (project, break or defaultProject?)
        // eg. only defaultProjects have a days property while only breaks have an endTime property etc.

        let roundTo = this.props.settings.roundTo || 5

        if(type === "default"){
          inputValues.days = []
          for(let i = 0; i < 7; i++) inputValues.days.push(true)
        }
        else{
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
            if(this.props.currentTime && !this.props.currentTime.defaultVal){
              startTime = TimeCalc.round(TimeCalc.add(this.props.currentTime, 15), roundTo)
            }
            // if both fail, simply set the value to 12 PM and mark it as a last resort value
            else startTime = {h: 12, m: 0, pm: true, lastResortValue: true}
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
        showErrors: {},
        temp: {dialogProjectId: false} // handles the days dialog of defaultProjects
      }
    }

    componentDidUpdate(){
      // if the user hasn't changed startTime yet, suggest a new startTime
      // (don't execute if the props haven't loaded yet)
      // eg. if the previous project's duration changes, we want the suggested start time to reflect that
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
        // only update if the current value is either empty or different from the suggested one
        if(
          this.state.inputValues.startTime.h === "" ||
          !TimeCalc.areIdentical(suggestedStartTime, this.state.inputValues.startTime)
        ){
          let inputValues = {...this.state.inputValues, startTime: suggestedStartTime}

          // if the HOC is used for a braek, suggest an endTime as well
          if(this.props.type === "break"){
            let suggestedEndTime = TimeCalc.round(TimeCalc.add(suggestedStartTime, 30), this.props.settings.roundTo)
            inputValues.endTime = suggestedEndTime
          }

          this.setState({inputValues})
        }
      }

      // only used if defaultColorIndex (and startTime) are being initialized with data from the localStorage
      // (if the component using the HOC is loaded immediately when the user visits the page
      // as opposed to being loaded after the user clicks a link, this data won't be available in the constructor yet)
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

        inputValues.color = defaultColors[defaultColorIndex] // set the correcponding color

        // handle undefined
        inputValues.color = inputValues.color ? inputValues.color : "#000000"

        this.setState({inputValues, defaultColorIndex})
      }

      // if currentTime wasn't available when the constructor ran and it was supposed to be used for the initial startTime value
      if(
        this.props.type !== "default" &&
        this.state.inputValues.startTime.lastResortValue &&
        this.props.currentTime &&
        this.props.settings.roundTo
      ){

        // suggest a new startTime
        let {inputValues} = this.state
        let {roundTo} = this.props.settings
        inputValues.startTime = TimeCalc.round(TimeCalc.add(this.props.currentTime, 15), roundTo)

        // if it's a break, suggest a new endTime as well
        if(this.props.type === "break"){
          inputValues.endTime = TimeCalc.round(TimeCalc.add(inputValues.startTime, 30), roundTo)
        }

        this.setState({inputValues})
      }
    }

    // handles simple text input changes
    handleInputChange(id, e){
      let val = e.target.value
      if(!inputValidation(id, val)) return
      this.setState({
        inputValues: {...this.state.inputValues, [id]: val},
        showErrors: {...this.state.showErrors, [id]: false}
      })
    }

    // handles time input changes, can either only change one field (eg. minutes) or the whole time object (if id === "object")
    handleTimeInputChange(inputId, id, val){
      let newState = {inputValues: this.state.inputValues, showErrors: this.state.showErrors}

      if(id === "object") newState.inputValues[inputId] = val
      else newState.inputValues[inputId][id] = val

      // if there was previously an error around the relevant time input, remove it
      // (since this method only gets called after input is validated in the TimeSetter component)
      newState.showErrors[inputId + id.toUpperCase()] = false
      newState.userHasntChangedStartTime = false

      this.setState(newState)
    }

    handleColorChange = val => {
      this.setState({inputValues: {...this.state.inputValues, color: val}})
    }

    // hide/show the dialog that lets you set days for defaultProjects
    toggleDaysDialog = val => this.setState({temp: {...this.state.temp, dialogProjectId: val}})

    handleDaysChange = (days) => {
      this.setState({inputValues: {...this.state.inputValues, days}})
    }

    render = () => {
      let wrappedComponent = (
        <WrappedComponent
          {...this.props}
          inputValues={this.state.inputValues}
          showErrors={this.state.showErrors}
          showErrorProp={this.props.showErrors ? this.props.showErrors.noProjects : false}
          onInputChange={this.handleInputChange.bind(this)}
          onTimeInputChange={this.handleTimeInputChange.bind(this)}
          onColorChange={this.handleColorChange}
          setState={this.setState.bind(this)}
          openDaysDialog={this.toggleDaysDialog.bind(this, true)}
        />
      )

      if(this.props.type === "default"){
        let {dialogProjectId} = this.state.temp

        return (
          <React.Fragment>
            {wrappedComponent}
            <Dialog
              open={dialogProjectId}
              onClose={this.toggleDaysDialog.bind(this, false)}
              aria-labelledby="DefaultProjectsDaysDialogTitle"
            >
              <DefaultProjectsDaysDialog
                project={this.state.inputValues}
                close={this.toggleDaysDialog.bind(this, false)}
                save={this.handleDaysChange}
              />
            </Dialog>
          </React.Fragment>
        )
      }

      return wrappedComponent
    }
  }
)

export default withInputFields
