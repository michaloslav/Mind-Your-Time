import React, { Component } from 'react';
import GoogleSignIn from './signIn/GoogleSignIn';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';
import HelpIcon from '@material-ui/icons/Help';
import GoogleIcon from './signIn/GoogleIcon'
import './css/DropdownMenu.css'

export default class DropdownMenu extends Component{
  constructor(props){
    super(props)
    this.state = {anchorEl: null}
  }

  close = () => {
    this.setState({anchorEl: null});
  }

  about = () => {
    this.close()
    this.props.history.push("/about")
  }

  signIn = tokenId => {
    this.close()
    this.props.connect(tokenId)
  }

  signOut = () => {
    this.close()
    this.props.disconnect();
  }

  render(){
    let anchorEl = this.state.anchorEl

    return (
      <React.Fragment>
        <IconButton
          id="dropdownMenuButton"
          aria-owns={anchorEl ? 'dropdownMenu' : undefined}
          aria-haspopup="true"
          onClick={e => {this.setState({anchorEl: e.currentTarget})}}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          id="dropdownMenu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.close}
        >
          <MenuItem onClick={this.about}>
            <HelpIcon />
            About
          </MenuItem>
          {
            this.props.loggedIn ? (
              <MenuItem onClick={this.signOut}>
                <CloseIcon />
                Sign Out
              </MenuItem>
            ) : (
              <GoogleSignIn connect={this.signIn} render={renderProps => (
                <MenuItem onClick={renderProps.onClick}>
                  <GoogleIcon />
                  Sign In
                </MenuItem>
              )} />
            )
          }
        </Menu>
      </React.Fragment>
    )
  }
}
