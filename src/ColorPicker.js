import React, { Component } from 'react';
import './css/ColorPicker.css'

export default class ColorPicker extends Component {
  constructor(props){
    super(props)
    this.state = {}

    this.colorInput = React.createRef()
  }

  render = () => (
    <span className="ColorPicker">
      <input
        className="colorInput"
        ref={input => this.colorInput = input}
        type="color"
        aria-label="Color"
        value={this.props.value}
        onChange={e => {this.props.onChange(e.target.value)}}/>
      <svg
        width={this.props.xl ? 50 : 20}
        height={this.props.xl ? 30 : 20}
        onClick={() => {this.colorInput.click()}}
      >
        {this.props.xl ? (
          <rect width="50" height="30" rx="5" ry="5" style={{fill: this.props.value}} />
        ) : (
          <circle cx="10" cy="10" r=".5rem" fill={this.props.value} />
        )}

      </svg>
    </span>
  )
}
