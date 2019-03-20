import React, { Component } from 'react'
import GoogleSignIn from './signIn/GoogleSignIn';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Collapse from '@material-ui/core/Collapse';
import TodayIcon from '@material-ui/icons/Today';
import WorkIcon from '@material-ui/icons/Work';
import SettingsIcon from '@material-ui/icons/Settings';
import HelpIcon from '@material-ui/icons/Help';
import GoogleIcon from './signIn/GoogleIcon'
import CloseIcon from '@material-ui/icons/Close';
import PauseIcon from '@material-ui/icons/Pause';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { withRouter } from "react-router";
import getGetParams from './util/getGetParams'
import './css/DrawerMenu.css'

class DrawerMenu extends Component{
  constructor(props){
    super(props)

    let state = this.checkActive(true)

    this.state = {
      planningCollapseOpen: false,
      ...state
    }
  }

  componentDidUpdate(){
    // set the timeout only if it isn't set already
    if(!this.state.checkActiveTimeout){
      this.setState({
        checkActiveTimeout: setTimeout(() => {
          this.checkActive()
          this.setState({checkActiveTimeout: null})
        }, 500)
      })
    }
  }

  componentWillUnmount(){
    let { checkActiveTimeout } = this.state
    clearTimeout(checkActiveTimeout)
    this.setState({checkActiveTimeout})
  }

  signIn = tokenId => {
    this.props.close()
    this.props.connect(tokenId)
  }

  signOut = () => {
    this.props.close()
    this.props.disconnect();
  }

  navigate(to){
    this.props.history.push("/" + to)
    this.props.close()
  }

  modeSwitch(mode){
    this.props.changeMode(mode)
    if(this.props.location.pathname !== "/") this.props.history.push("/")
    this.props.close()
  }

  togglePlanningCollapse = e => {
    e.stopPropagation()
    this.setState({planningCollapseOpen: !this.state.planningCollapseOpen})
    this.props.setNavbarState({planningCollapseOpenExplicit: true})
  }

  checkActive = (returnDontUpdate = false) => {
    let active
    let pathname = this.props.location.pathname
    if(pathname === "/") active = this.props.mode
    else{
      let pathname0 = this.props.location.pathname.split("/")[1]
      if(pathname0 === "add" || pathname0 === "edit"){
        let { type } = getGetParams(this.props.location.search)
        switch(type){
          case "default":
            active = "defaultProjects"
            break
          case "break":
            active = "breaks"
            break
          default:
            active = "planning"
        }
      }
      else active = pathname0
    }

    let planningCollapseOpen = (active === "planning" || active === "breaks" || active === "defaultProjects")

    if(returnDontUpdate) return {active, planningCollapseOpen}

    // check if there's anything to be updated
    let newState = {}
    if(active !== this.state.active) newState.active = active
    if(
      planningCollapseOpen !== this.state.planningCollapseOpen &&
      !this.props.planningCollapseOpenExplicit
    ){
      newState.planningCollapseOpen = planningCollapseOpen
    }
    if(Object.keys(newState).length) this.setState(newState)
  }

  render = () => (
    <List>
      <ListItem button onClick={this.modeSwitch.bind(this, "planning")}>
        <ListItemIcon>
          <TodayIcon color={this.state.active === "planning" ? "primary" : undefined} />
        </ListItemIcon>
        <ListItemText primary="Planning" />
        <IconButton
          onClick={this.togglePlanningCollapse}
          style={{padding: 0}}
        >
          {this.state.planningCollapseOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </ListItem>
      <Collapse in={this.state.planningCollapseOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {[
            {
              title: "Breaks",
              icon: <PauseIcon color={this.state.active === "breaks" ? "primary" : undefined} />,
              onClick: this.navigate.bind(this, "breaks")
            },
            {
              title: "Repetitive projects",
              icon: <AutorenewIcon color={this.state.active === "defaultProjects" ? "primary" : undefined} />,
              onClick: this.navigate.bind(this, "defaultProjects")
            }
          ].map(el => (
            <ListItem key={el.title} button onClick={el.onClick} style={{paddingLeft: "2rem"}}>
              <ListItemIcon children={el.icon} />
              <ListItemText inset primary={el.title} />
            </ListItem>
          ))}
        </List>
      </Collapse>
      {
        [
          {
            title: "Working",
            icon: <WorkIcon color={this.state.active === "working" ? "primary" : undefined} />,
            onClick: this.modeSwitch.bind(this, "working")
          },
          {
            title: "Settings",
            icon: <SettingsIcon color={this.state.active === "settings" ? "primary" : undefined} />,
            onClick: this.navigate.bind(this, "settings")
          },
          {
            title: "About",
            icon: <HelpIcon color={this.state.active === "about" ? "primary" : undefined} />,
            onClick: this.navigate.bind(this, "about")
          }
        ].map(el => (
          <ListItem key={el.title} button onClick={el.onClick}>
            <ListItemIcon children={el.icon} />
            <ListItemText primary={el.title} />
          </ListItem>
        ))
      }
      {
        this.props.loggedIn ? (
          <ListItem button onClick={this.signOut}>
            <ListItemIcon>
              <CloseIcon />
            </ListItemIcon>
            <ListItemText primary="Sign Out" />
          </ListItem>
        ) : (
          <GoogleSignIn connect={this.signIn} render={renderProps => (
            <ListItem button onClick={renderProps.onClick}>
              <ListItemIcon>
                <GoogleIcon />
              </ListItemIcon>
              <ListItemText primary="Sign In" />
            </ListItem>
          )} />
        )
      }
    </List>
  )
}

export default withRouter(DrawerMenu)
