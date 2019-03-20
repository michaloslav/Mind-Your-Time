import React, { Component } from 'react';
import Input from '@material-ui/core/Input';
import IconButton from '@material-ui/core/IconButton';
import DoneIcon from '@material-ui/icons/Done';
import TimeCalc from './util/TimeCalc'
import './css/SetProgressPopoverContent.css'

export default class SetProgressPopoverContent extends Component{
  constructor(props){
    super(props)

    let progress = TimeCalc.subtractToMinutes(props.currentTime, props.row.startedWorkingOnIt, true)
    if(props.row.progress) progress = progress + parseInt(props.row.progress)

    this.state = {progress}
  }

  handleInputChange = e => {
    let val = e.target.value

    if(isNaN(val)) return

    this.setState({progress: val})
  }

  save = () => {
    this.props.onPause(this.props.row.id, "paused", this.state.progress)
  }

  render = () => (
    <div className="SetProgressPopoverContent">
      <span>I've worked on this for </span>
      <Input
        autoFocus
        aria-label="Progress in minutes"
        value={this.state.progress || ""}
        onChange={this.handleInputChange}
        onKeyPress={e => {if(e.key === "Enter") this.save()}}
      />
      <span> minutes</span>
      <IconButton
        aria-label="Save the progress and pause the project"
        onClick={this.save}
        color="primary">
        <DoneIcon />
      </IconButton>
    </div>
  )
}
