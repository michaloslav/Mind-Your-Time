import React, { Component } from 'react'
import TimeInput from 'material-ui-time-picker'
import TimeCalc from './util/TimeCalc'

// serves as a wrapper/"middleware" to convert between the data structure used by the app and the one used by the time-picker module
export default class TimeSetterMobile extends Component{
  handleChange = date => {
    // convert into a TimeObject
    let valInMinutes = date.getHours() * 60 + date.getMinutes()
    let val = TimeCalc.toTimeObject(valInMinutes)

    // save
    this.props.onChange("object", val)
  }

  render(){
    // convert the value into a Date
    let value = new Date()
    let hours = this.props.value.h
    if(this.props.value.pm) hours += 12
    value.setHours(hours)
    value.setMinutes(this.props.value.m)

    return (
      <TimeInput
        className="TimeSetterMobile"
        mode={this.props.mode}
        value={value}
        onChange={this.handleChange}
        error={this.props.error}
      />
    )
  }

}
