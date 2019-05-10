import React, { Component } from 'react'
import { projectValidation, breakValidation } from '../util/validation'
import withInputFields from './withInputFields'

// adds functionality to edit projects, breaks and defaultProjects to both the desktop and the mobile version
const withEdit = WrappedComponent => (
  withInputFields(
    class withEdit extends Component{
      save = () => {
        let { inputValues, type } = this.props

        // validation
        let validation
        if(type === "break") validation = breakValidation(inputValues)
        else validation = projectValidation(inputValues, type === "default")

        // if validation fails, display the errors
        if(!validation.valid){
          let newState = this.props.showErrors
          validation.errors.forEach(error => {
            newState[error] = true
          })
          this.props.setState(newState)
          return
        }

        // call the props functions to save and close
        this.props.onDoneEditing(this.props.inputValues)
        this.props.close()
      }

      handleKeyPress = e => {if(e.key === "Enter") this.save()}

      render = () => (
        <WrappedComponent
          {...this.props}
          save={this.save}
          onKeyPress={this.handleKeyPress}
        />
      )
    }
  )
)

export default withEdit
