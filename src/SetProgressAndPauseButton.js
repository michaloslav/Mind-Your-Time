import React, { Component } from 'react';
import SetProgressPopoverContent from './SetProgressPopoverContent'
import Popover from '@material-ui/core/Popover';
import IconButton from '@material-ui/core/IconButton';
import PauseIcon from '@material-ui/icons/Pause';

// the button responsible for pausing the project and the Popover associated with it
// (the Popover lets you set progress)
export default class SetProgressAndPauseButton extends Component{
  constructor(props){
    super(props)
    this.state = {
      anchorEl: null
    }
  }

  handleClick = e => {
    this.setState({anchorEl: e.currentTarget})
  }

  close = () => {
    this.setState({anchorEl: null})
  }

  render(){
    let anchorEl = this.state.anchorEl

    return (
      <React.Fragment>
        <IconButton  aria-label="Pause the project" onClick={this.handleClick}>
          <PauseIcon />
        </IconButton>

        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={this.close}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <SetProgressPopoverContent {...this.props} />
        </Popover>
      </React.Fragment>
    )
  }
}
