import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import App from "./App"
import Settings from "./Settings"
import About from "./About"
import LinkToRoot from './LinkToRoot'
import { HashLink } from 'react-router-hash-link';
import { defaultSettings } from './_defaultSettings'



export default class AppRouter extends Component {
  AppWithProps = (props) => (
    <App
      data={this.props.data}
      connect={this.props.connect}
      update={this.props.update}
      disconnect={this.props.disconnect}
      loggedIn={this.props.loggedIn}
      {...props}
    />
  )
  SettingsWithProps = (props) => (
    <Settings
      settings={Object.assign({}, this.props.data.settings)}
      defaultSettings={defaultSettings}
      update={this.props.update}
      {...props}
    />
  )

  render(){
    return (
      <Router>
        <div style={{position: "relative", minWidth: "calc(660px - 2rem)"}}>
          <Switch>
            <Route path="/" exact />
            <Route component={LinkToRoot} />
          </Switch>
          <Switch>
            <Route path="/settings/" render={this.SettingsWithProps}/>
            <Route path="/about/" component={About}/>
            <Route path="/robots.txt" target="_self" />
            <Route render={this.AppWithProps}/>
          </Switch>
          <footer>
            Created by <a href="https://github.com/michaloslav">Michael Farník</a>
            <span> | </span>
            <a href="https://goo.gl/forms/jdesExEMegbkLPjp2" target="_blank" rel="noopener noreferrer">Feedback</a>
            <span> | </span>
            <HashLink to="/about#contact">Contact</HashLink>
            <div>
              Icon made by <a href="https://www.flaticon.com/authors/kiranshastry" title="Kiranshastry" target="_blank" rel="noopener noreferrer">Kiranshastry</a> from <a href="https://www.flaticon.com/" title="Flaticon" target="_blank" rel="noopener noreferrer">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank" rel="noopener noreferrer">CC 3.0 BY</a>
            </div>
          </footer>
        </div>
      </Router>
    )
  }
}
