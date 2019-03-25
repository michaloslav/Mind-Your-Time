import React, { Component } from 'react';
import GoogleLogin from 'react-google-login';

export default class GoogleSignIn extends Component {
  responseGoogle = res => {
    if(res.error){
      console.log(res);
      return
    }

    if(window.confirm("Data syncing is still under construction and may not work properly all the time yet. Are you sure you want to continue?")) this.props.connect(res.tokenId)
  }

  render = () => (
    <GoogleLogin
      clientId="1070394852834-4nunul2jqv2pqn9du9ralgd61220d3c1.apps.googleusercontent.com"
      buttonText="Sign In"
      onSuccess={this.responseGoogle}
      onFailure={this.responseGoogle}
      render={this.props.render}
    />
  )
}
