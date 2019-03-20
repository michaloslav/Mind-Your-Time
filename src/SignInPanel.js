import React, { Component } from 'react';
import GoogleSignIn from './signIn/GoogleSignIn';
import Grid from '@material-ui/core/Grid'
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import './css/SignInPanel.css'

export default class SignInPanel extends Component {
  constructor(props){
    super(props)
    this.state = {anchorEl: null}
  }

  handleDismiss = e => {
    // if this is the first time the user is dismissing the panel, only dismiss it
    if(!this.props.showDontRemindMeAgain) this.props.dismiss()
    // if the user has dismissed it before, let them chose if they want to do it permanently this time
    else this.setState({anchorEl: e.currentTarget})
  }

  closeDismissMenu = () => {
    this.setState({anchorEl: null})
  }

  render(){
    let anchorEl = this.state.anchorEl

    return (
      <div className="signInPanel">
        <Grid
          className="signInPanelContainer"
          container
          alignItems='center'
          justify="space-evenly"
        >
          <Grid>
            Sign in to sync your data between all your devices:
          </Grid>
          <Grid>
            <GoogleSignIn connect={this.props.connect}/>
          </Grid>
        </Grid>
        <IconButton
          className="dismissButton"
          onClick={this.handleDismiss}
          aria-owns={anchorEl ? 'signInPanelDismissMenu' : undefined}
        >
          <CloseIcon />
        </IconButton>
        {this.props.showDontRemindMeAgain && ( //saves performance
          <Menu
            id="signInPanelDismissMenu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={this.closeDismissMenu}
          >
            <MenuItem onClick={() => {this.closeDismissMenu(); this.props.dismiss()}}>
              Remind me later
            </MenuItem>
            <MenuItem onClick={() => {this.closeDismissMenu(); this.props.dontRemindMeAgain()}}>
              Don't remind me again
            </MenuItem>
          </Menu>
        )}
      </div>
    )
  }
}
