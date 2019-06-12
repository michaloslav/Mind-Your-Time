import React, { Component } from 'react';
import Spinner from 'react-md-spinner';

export default class LoadingFallback extends Component{
  constructor(props){
    super(props)
    this.state = {
      show: false,
      showTimeout: setTimeout(() => this.setState({show: true}), 100)
    }
  }

  componentWillUnmount(){
    clearTimeout(this.state.showTimeout)
  }

  render(){
    if(this.state.show) return <Spinner singleColor="#039be5"/>
    else return null
  }
}
