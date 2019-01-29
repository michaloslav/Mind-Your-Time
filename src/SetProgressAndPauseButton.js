import React, { Component } from 'react';
import Popover from '@material-ui/core/Popover';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import PauseIcon from '@material-ui/icons/Pause';
import DoneIcon from '@material-ui/icons/Done';
import TimeCalc from './util/TimeCalc'

export default class SetProgressAndPauseButton extends Component{
  constructor(props){
    super(props)
    this.state = {
      anchorEl: null,
      progress: ""
    }
  }

  handleClick = e => {
    let progress = TimeCalc.subtractToMinutes(this.props.currentTime, this.props.row.startedWorkingOnIt, true)
    if(this.props.row.progress) progress = progress + parseInt(this.props.row.progress)

    this.setState({
      anchorEl: e.currentTarget,
      progress: progress
    })
  }

  handleClose = () => {
    this.setState({anchorEl: null})
  }

  handleInputChange = e => {
    let val = e.target.value

    if(isNaN(val)) return

    this.setState({progress: val})
  }

  handleSaveClick = () => {
    this.props.onPause(this.props.row.id, "paused", this.state.progress)
  }

  render(){
    let anchorEl = this.state.anchorEl
    let open = Boolean(anchorEl)

    return (
      <React.Fragment>
        <IconButton  aria-label="Pause the project" onClick={this.handleClick}>
          <PauseIcon />
        </IconButton>

        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={this.handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}>
          <div className="setProgressPopover">
            <span>I've worked on this for </span>
            <Input
              autoFocus
              aria-label="Progress in minutes"
              value={this.state.progress}
              onChange={this.handleInputChange}
              onKeyPress={e => {if(e.key === "Enter") this.handleSaveClick()}}
            />
            <span> minutes</span>
            <IconButton
              aria-label="Save the progress and pause the project"
              onClick={this.handleSaveClick}
              color="primary">
              <DoneIcon />
            </IconButton>
          </div>
        </Popover>
      </React.Fragment>
    )
  }
}
