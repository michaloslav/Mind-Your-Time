import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import App from "./App"
import Settings from "./Settings"
import About from "./About"
import LinkToRoot from './LinkToRoot'
import { HashLink } from 'react-router-hash-link';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';

const defaultSettings = {
  timeFormat24H: false,
  bufferTimePercentage: .2,
  showResetButtonAfter: 16, // in hours
  defaultColors: [
    "#4BFFD1",
    "#39FF00",
    "#E8A60C",
    "#FF4848",
    "#290CE8",
  ],
  updateTimesAfterDrag: true,
  updateTimesAfterEdit: true,
  updateTimesAfterDelete: true,
  roundTo: 5,
  changeModeOnTab: false,
  detectBreaksAutomatically: true
}


const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#039be5',
    },
    secondary: green
  },
  typography: {
    useNextVariants: true
  }
})

export default class AppRouter extends Component {
  constructor(props){
    super(props)
    this.state = {
      settings: {}
    }
  }

  componentDidMount(){
    let settings

    try {
      settings = JSON.parse(localStorage.settings)
    }
    catch (e) {
      settings = defaultSettings
    }

    this.setState({settings})
  }

  handleSettingsChange(settings){
    this.setState({settings})
    localStorage.settings = JSON.stringify(settings)
  }

  AppWithProps = (props) => <App settings={this.state.settings} {...props}/>
  SettingsWithProps = (props) => (
    <Settings
      settings={this.state.settings}
      defaultSettings={defaultSettings}
      onSettingsChange={this.handleSettingsChange.bind(this)}
      {...props}/>
  )

  render(){
    return (
      <Router>
        <MuiThemeProvider theme={theme}>
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
        </MuiThemeProvider>
      </Router>
    )
  }
}
