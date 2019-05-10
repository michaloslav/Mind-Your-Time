import React, { Component } from 'react';
import Confetti from 'react-dom-confetti';
import './css/ConfettiWrapper.css'

// necessary to prevent the confetti from overflowing which would display scrollbars
// (used to congratulate the user on finishing all their work)
export default class ConfettiWrapper extends Component{
  constructor(props){
    super(props)
    this.state = {}
    // for some reason the Confetti module can only be fired by an update
    setTimeout(() => this.setState({fireConfetti: true}))
  }

  render = () => (
    <div className="ConfettiWrapper">
      <div>
        <Confetti active={this.state.fireConfetti}
          config={{
            spread: 80,
            startVelocity: 90,
            elementCount: 185,
            dragFriction: .07,
            duration: 10000
          }}
        />
      </div>
    </div>
  )
}
