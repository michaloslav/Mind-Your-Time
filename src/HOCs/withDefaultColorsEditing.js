import React, { Component } from 'react'

// adds functionality used in both the desktop version of settings and the mobile view responsible for editing default colors
const withDefaultColorsEditing = WrappedComponent => (
  class withDefaultColorsEditing extends Component{
    constructor(props){
      super(props)
      let state = {}

      // if the settings are loaded already, load them into the state
      if(this.props.settings && this.props.settings.defaultColors){
        state.defaultColors = this.props.settings.defaultColors
      }

      this.state = state
    }

    componentDidUpdate(){
      // only execute if it's the init with data from localStorage
      // (if the user loads the page using this HOC directly instead of clicking on a router link leading here, the data won't be available immediately)
      if(
        typeof this.state.defaultColors === "undefined" &&
        this.props.settings
      ){
        this.setState({defaultColors: this.props.settings.defaultColors})
      }
    }

    handleDefaultColorChange(i, val){
      let defaultColors = this.state.defaultColors
      defaultColors[i] = val
      this.setState({defaultColors})
    }

    addDefaultColor = () => {
      let defaultColors = this.state.defaultColors
      // generate a random new color
      let newColor = "#" + (Math.random() * 16777216).toString(16).substr(0, 6)
      defaultColors.push(newColor)
      this.setState({defaultColors})
    }

    removeDefaultColor(i){
      let defaultColors = this.state.defaultColors
      defaultColors.splice(i, 1)
      this.setState({defaultColors})
    }

    save = () => {
      if(typeof this.props.save === "function") this.props.save(this.state.defaultColors)
    }

    render = () => (
      <WrappedComponent
        {...this.props}
        onDefaultColorChange={this.handleDefaultColorChange.bind(this)}
        addDefaultColor={this.addDefaultColor}
        removeDefaultColor={this.removeDefaultColor.bind(this)}
        save={this.save}
      />
    )
  }
)

export default withDefaultColorsEditing
