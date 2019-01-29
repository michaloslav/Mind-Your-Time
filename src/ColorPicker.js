import React, { Component } from 'react';

export default class ColorPicker extends Component {
  constructor(props){
    super(props)
    this.state = {

    }

    this.colorInput = React.createRef()
  }

  handleClick(){
    this.colorInput.click()
  }

  handleChange(e){
    this.props.onChange(e.target.value)
  }

  render(){
    return (
      <span className="ColorPicker">
        <input
          className="colorInput"
          ref={input => this.colorInput = input}
          type="color"
          aria-label="Color"
          value={this.props.value}
          onChange={this.handleChange.bind(this)}/>
        <svg onClick={this.handleClick.bind(this)} width="20" height="20">
          <circle cx="10" cy="10" r=".5rem" fill={this.props.value} />
        </svg>
      </span>
    )
  }
}
