import React, { Component } from 'react';
import GoogleLogin from 'react-google-login';

export default class GoogleSignIn extends Component {
  responseGoogle = res => {
    if(res.error){
      console.log(res);
      return
    }

    // execute as a makrotask to make sure the tab is active when the confirm method fires
    setTimeout(() => {
      if(window.confirm("Data syncing is still under beta testing. If you encouter any problems, please send us a bug report. It will only take a minute or two and it helps us a lot with improving the app.")){
        this.props.connect(res.tokenId)
      }
    }, 50)
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
