import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import App from "./App"
import Settings from "./Settings"
import About from "./About"
import SettingsDefaultColors from "./MobileViews/SettingsDefaultColors"
import LinkToRoot from './LinkToRoot'
import Navbar from "./Navbar"
import Footer from "./Footer"
import { defaultSettings } from './util/_defaultSettings'
import { IsMobileContext } from './_Context'

export default class AppRouter extends Component {
  constructor(props){
    super(props)
    this.state = {
      width: window.innerWidth,
      currentTime: {
        h: 0,
        m: 0,
        pm: true,
        defaultVal: true
      },
      showErrors: {}
    }
  }
  componentWillMount(){
    window.addEventListener("resize", () => {
      this.setState({width: window.innerWidth})
    })
  }

  AppWithProps = props => (
    <App
      data={this.props.data}
      connect={this.props.connect}
      changeMode={this.changeMode}
      update={this.props.update}
      disconnect={this.props.disconnect}
      loggedIn={this.props.loggedIn}
      disconnected={this.props.disconnected}
      currentTime={this.state.currentTime}
      showErrors={this.state.showErrors}
      changeRouterShowErrors={this.changeShowErrors}
      onCurrentTimeChange={currentTime => {this.setState({currentTime})}}
      {...props}
    />
  )

  SettingsWithProps = props => (
    <Settings
      settings={Object.assign({}, this.props.data.settings)}
      defaultSettings={defaultSettings}
      update={this.props.update}
      {...props}
    />
  )

  SettingsDefaultColorsWithProps = props => (
    <SettingsDefaultColors
      settings={Object.assign({}, this.props.data.settings)}
      save={defaultColors => {
        this.props.update({settings: {...this.props.data.settings, defaultColors}})
      }}
      {...props}
    />
  )

  changeMode = val => {
    // don't let the user go into work mode if there isn't an endTime or if projects are empty  (+ show an error)
    if(val === "working"){
      if(this.props.data.endTime.h === "" || this.props.data.endTime.m === ""){
        this.changeShowErrors("endTime", true)
        return
      }
      if(!this.props.data.projects.length){
        this.changeShowErrors("noProjects", true)
        return
      }
    }

    this.props.update({mode: val})
  }

  changeShowErrors = (id, val) => {
    this.setState({showErrors: {...this.state.showErrors, [id]: val}})
  }

  render(){
    let isMobile = this.state.width < 660

    return (
      <Router>
        <div style={{position: "relative"}}>
          {
            isMobile ? (
                <Navbar
                  data={this.props.data}
                  connect={this.props.connect}
                  changeMode={this.changeMode}
                  disconnect={this.props.disconnect}
                  loggedIn={this.props.loggedIn}
                  currentTime={this.state.currentTime}
                  onCurrentTimeChange={currentTime => {this.setState({currentTime})}}
                />
              ) : (
                <Switch>
                  <Route path="/(|add|edit|breaks|defaultProjects)" exact />
                  <Route component={LinkToRoot} />
                </Switch>
            )
          }
          <IsMobileContext.Provider value={isMobile}>
            <Switch>
              <Route path="/settings/defaultColors/" render={this.SettingsDefaultColorsWithProps}/>
              <Route path="/settings/" render={this.SettingsWithProps}/>
              <Route path="/about/" component={About}/>
              <Route path="/robots.txt" target="_self" />
              <Route path="/(|add|edit|breaks|defaultProjects)" exact render={this.AppWithProps}/>
              <Route render={() => <Redirect to="/" />} />
            </Switch>
          </IsMobileContext.Provider>
          {
            isMobile ? (
              <Route path="/about/" component={Footer} />
            ) : (
              <Footer />
            )
          }
        </div>
      </Router>
    )
  }
}
