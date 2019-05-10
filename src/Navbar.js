import React, { Component } from 'react';
import DrawerMenu from './DrawerMenu'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid'
import MenuIcon from '@material-ui/icons/Menu';
import TimeStats from './TimeStats'
import './css/Navbar.css'

// the mobile navbar
export default class Navbar extends Component{
  constructor(props){
    super(props)
    this.state = {
      drawerOpen: false, // this opens/closes the swipeable "menu" on the left
      planningCollapseOpenExplicit: false
    }
  }

  open = () => {
    this.setState({drawerOpen: true})
  }

  close = () => {
    this.setState({
      drawerOpen: false,
      planningCollapseOpenExplicit: false
    })
  }

  render = () => (
    <React.Fragment>
      <AppBar id="Navbar">
        <Toolbar>
            <IconButton
              id="openDrawerMenuButton"
              aria-label="Menu"
              onClick={this.state.drawerOpen ? this.close : this.open}
            >
              <MenuIcon />
            </IconButton>
            <Grid
              id="TimeStatsContainer"
              container
              alignItems='baseline'
              justify="space-between">
            <TimeStats
              currentTime={this.props.currentTime}
              onCurrentTimeChange={this.props.onCurrentTimeChange}
              endTime={this.props.data.endTime}
              projects={this.props.data.projects}
              breaks={this.props.data.breaks}
              settings={this.props.data.settings}
              startTime={this.props.data.startTime}
              realEndTime={this.props.data.realEndTime}
              shortLabels
            />
          </Grid>
        </Toolbar>
      </AppBar>
      <SwipeableDrawer
        id="DrawerMenu"
        open={this.state.drawerOpen}
        onOpen={this.open}
        onClose={this.close}
      >
        <DrawerMenu
          connect={this.props.connect}
          disconnect={this.props.disconnect}
          loggedIn={this.props.loggedIn}
          mode={this.props.data.mode}
          changeMode={this.props.changeMode}
          setNavbarState={this.setState.bind(this)}
          close={this.close}
          planningCollapseOpenExplicit={this.state.planningCollapseOpenExplicit}
          data={localStorage.devUnlocked ? this.props.data : {}}
          update={this.props.update}
        />
      </SwipeableDrawer>
    </React.Fragment>
  )
}
