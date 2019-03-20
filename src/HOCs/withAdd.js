import React, { Component } from 'react'
import { projectValidation, breakValidation } from '../util/validation'
import withInputFields from './withInputFields'

const withAdd = WrappedComponent => (
  withInputFields(
    class withAdd extends Component{
      add = callback => {
        let { inputValues, type } = this.props

        // validation
        let validation
        if(type === "break") validation = breakValidation(inputValues)
        else validation = projectValidation(inputValues, type === "default")

        if(!validation.valid){
          let newState = this.props.showErrors
          validation.errors.forEach(error => {
            newState[error] = true
          })
          this.setState(newState)
          return
        }

        // reset the state
        let newInputValues = {name: ""}
        let newDefaultColorIndex
        if(type !== "default") newInputValues.startTime = {h: "", m: "", pm: true}
        if(type === "break"){
          newInputValues.endTime = {h: "", m: "", pm: true}
          this.props.onAddBreak(this.props.inputValues)
        }
        else{
          newInputValues.duration = ""
          newInputValues.color = inputValues.color // perserve the color

          // if the user hasn't changed the color from the default, go to the next defaultColor
          let defaultColors = this.props.settings.defaultColors
          let defaultColorIndex = this.props.defaultColorIndex

          newDefaultColorIndex = defaultColorIndex >= defaultColors.length - 1 ? 0 : ++defaultColorIndex

          newInputValues.color = defaultColors[newDefaultColorIndex]

          // call the props function
          this.props.onAddProject(this.props.inputValues, newDefaultColorIndex)
        }

        // save to state
        let newState = {inputValues: newInputValues}
        if(type !== "break") newState.defaultColorIndex = newDefaultColorIndex
        this.props.setState(newState)

        if(typeof callback === "function") callback()
      }

      handleKeyPress = e => {if(e.key === "Enter") this.add()}

      render = () => (
        <WrappedComponent
          {...this.props}
          add={this.add}
          onKeyPress={this.handleKeyPress}
        />
      )
    }
  )
)

export default withAdd
