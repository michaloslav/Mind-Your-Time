import React, { Component } from 'react';
import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TimeCalc from './util/TimeCalc'

// simple validation
function isValidNumberInput(val, minSize, maxSize){
  if(
    val === "" || (
      !isNaN(val) && // if it's a number or an emty string and...
      val >= minSize && val <= maxSize // the correct size
    )
  ) return true
  else return false
}


export default class TimeSetter extends Component {
  handleInputChange(id, e){
    // get the input value
    let val
    if(typeof e === "number") val = e // needs to accept the input from handleKeyDown
    else{
      // get the value depending on the id
      if(id === "pm") val = e.target.value === "PM"
      else val = e.target.value
    }

    // validate the input
    let maxHValue = this.props.settings.timeFormat24H ? 24 : 12
    if((id === "h" && !isValidNumberInput(val, 1, maxHValue))
      || (id === "m" && !isValidNumberInput(val, 0, 59))
    ) return


    // if we're using the 24-hour time format for the UI, convert it back over to the normal format
    if(this.props.settings.timeFormat24H && id === "h"){
      if(val >= 12){
        val -= 12
        this.props.onChange("pm", true)
      }
      else this.props.onChange("pm", false)
    }


    // emit the change up the chain
    this.props.onChange(id, val)
  }

  handleKeyPress = e => {
    if(e.key === "Enter" && this.props.onEnterPress) this.props.onEnterPress()
  }

  handleKeyDown(id, e){
    // determine what is to be done
    let action
    if(e.key === "ArrowUp") action = "up"
    if(e.key === "ArrowDown") action = "down"

    // if nothing is supposed to be done, stop the execution
    if(!action) return

    // get the value, handle empty input
    let val = this.props.value
    if(!val || isNaN(val.m)) val = 0

    // edit the val
    let incrementation = id === "m" ? this.props.settings.roundTo : 60
    if(action === "up") val = TimeCalc.add(val, incrementation)
    else val = TimeCalc.toTimeObject(TimeCalc.subtractToMinutes(val, incrementation), true)

    // handle negative values
    if(TimeCalc.isBiggerThan(0, val, false)) val = TimeCalc.add(val, 24*60)

    this.props.onChange("object", val)
  }

  render(){
    let h = this.props.value.h
    h = h === 0 ? 12 : h
    let m = this.props.value.m
    m = m === 0 ? "0" + m : m // turns 0 into "00"

    return (
      <div className={"TimeSetterDesktop" + (this.props.showError ? " timeSetterError" : "")} style={{display: "inline"}}>
        <Input
          onChange={this.handleInputChange.bind(this, "h")}
          value={(this.props.settings.timeFormat24H && this.props.value.pm) ? h + 12 : h}
          id={this.props.firstInputId}
          placeholder="Hours"
          aria-label="Hours"
          autoComplete="off"
          error={this.props.hError}
          onKeyPress={this.handleKeyPress}
          onKeyDown={this.handleKeyDown.bind(this, "h")}
        />
        :
        <Input
          onChange={this.handleInputChange.bind(this, "m")}
          value={m}
          placeholder="Minutes"
          aria-label="Minutes"
          autoComplete="off"
          error={this.props.mError}
          onKeyPress={this.handleKeyPress}
          onKeyDown={this.handleKeyDown.bind(this, "m")}
        />
        {!this.props.settings.timeFormat24H && (
          <Select
            onChange={this.handleInputChange.bind(this, "pm")}
            value={this.props.value.pm ? "PM" : "AM"}>
            <MenuItem value="AM">AM</MenuItem>
            <MenuItem value="PM">PM</MenuItem>
          </Select>
        )}
      </div>
    )
  }
}
