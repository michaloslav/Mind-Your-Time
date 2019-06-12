import React, { Component } from 'react';

export default class ErrorBoundary extends Component{
  constructor(props){
    super(props)
    this.state = {
      hasError: false,
      error: null
    }
  }

  static getDerivedStateFromError(error){
    return {
      hasError: true,
      error
    }
  }

  render(){
    if(this.state.hasError) return (
      <div style={{textAlign: "center"}}>
        <h3 style={{color: "red"}}>Oops, something went wrong</h3>
        Please, try <b>reloading</b> the page
        <br/><br/><br/>
        If you keep seeing this message, <b>
          send us a bug report{" "}
          <a className="noStyling" href="https://goo.gl/forms/jdesExEMegbkLPjp2" target="_blank" rel="noopener noreferrer">
            here
          </a>
        </b>
        <br/>
        While doing that, make sure you <b>tell us what you were trying to do</b>. This helps us a lot when fixing issues.
        <br/>
        {this.state.error && (
          <>
            Please also <b>include the following information</b> in the bug report:
            <p><code>{this.state.error.toString()}</code></p>
          </>
        )}
      </div>
    )

    return this.props.children
  }
}
