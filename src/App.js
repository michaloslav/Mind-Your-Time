import React, { Component } from 'react';
import ModeSwitch from './ModeSwitch'
import ProjectsTable from './ProjectsTable'
import TimeSetter from './TimeSetter'
import TimeStats from './TimeStats'
import BreaksDrawer from './BreaksDrawer'
import SignInPanel from './SignInPanel'
import DropdownMenu from './DropdownMenu'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import Slide from '@material-ui/core/Slide';
import { Link } from "react-router-dom";
import SettingsIcon from '@material-ui/icons/Settings';
import PauseIcon from '@material-ui/icons/Pause';
import StartIcon from '@material-ui/icons/PlayArrow';
import TimeCalc, { setTimesForProjects } from './util/TimeCalc'
import makeNewId from './util/makeNewId'
import { SettingsContext } from './_Context'

export default class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      currentTime: {
        h: 0,
        m: 0,
        pm: true
      },
      showErrors: {
        endTime: false,
        noProjects: false
      },
      showResetButton: false,
      temp: {
        dontShowSignInYet: true
      }
    }

    // only show the sign in panel after a little while
    setTimeout(() => {
      this.setState({temp: {...this.state.temp, dontShowSignInYet: false}})
    }, 5000)
  }

  componentDidUpdate(prevProps){
    if(!Object.keys(prevProps.data.settings).length && Object.keys(this.props.data.settings).length){
      this.setShowResetButton()
    }

    // check if all projects are done
    let allProjectsDone = false
    let productivityPercentage, totalTimeWorkedString

    if(this.props.data.projects.length){
      allProjectsDone = true
      for(let i = 0; i < this.props.data.projects.length; i++){
        if(this.props.data.projects[i].state !== "done"){
          allProjectsDone = false
          break
        }
      }

      if(allProjectsDone){
        let totalTimeWorked = 0

        for(let i = 0; i < this.props.data.projects.length; i++) totalTimeWorked += parseInt(this.props.data.projects[i].estimatedDuration)

        if(totalTimeWorked >= 60) totalTimeWorkedString = TimeCalc.makeString(TimeCalc.toTimeObject(totalTimeWorked, false), false)
        else totalTimeWorkedString += " minutes"

        // if the productivityPercentage was already stored, use it
        if(this.props.data.productivityPercentage){
          productivityPercentage = this.props.data.productivityPercentage
        }
        // else calculate and store it
        else{
          let totalTimePassed = TimeCalc.subtractToMinutes(this.state.currentTime, this.props.data.startTime, true)
          productivityPercentage = Math.round(100 * totalTimeWorked / totalTimePassed)
        }
      }
    }
    else allProjectsDone = false

    if(allProjectsDone !== this.state.allProjectsDone) this.setState({allProjectsDone})
    if(totalTimeWorkedString !== this.state.totalTimeWorkedString) this.setState({totalTimeWorkedString})
    if(productivityPercentage !== this.props.data.productivityPercentage) this.props.update({productivityPercentage})
  }

  // internal method, used in componentDidMount and componentDidUpdate
  setShowResetButton = () => {
    let condition1, condition2

    // show the reset button if 5AM is between lastReset and currentTime
    let lastResetInMs = new Date(localStorage.lastReset).getTime() // ms since 1970
    lastResetInMs = lastResetInMs % (24*60*60*1000)
    let lastResetInMinutes = lastResetInMs / 1000 / 60
    condition1 = TimeCalc.isBiggerThan(lastResetInMinutes, this.state.currentTime, false, true)

    // only check for condition2 if condition1 doesn't check out
    if(!condition1){
      // show the reset button if lastReset + showResetButtonAfter > currentTime
      let lastReset = new Date(localStorage.lastReset)
      let settings = this.props.data.settings.showResetButtonAfter ? this.props.data.settings : this.props.data.settings
      let showResetButtonAfter = settings.showResetButtonAfter
      lastReset.setTime(lastReset.getTime() + (showResetButtonAfter * 60 * 60 * 1000))
      condition2 = lastReset < new Date()
    }

    // only one of the two needs to be true to show the reset button
    let showResetButton = condition1 || condition2
    this.setState({showResetButton})
  }

  // internal method, used when auto detecting breaks
  addBreak = (startTime, endTime) => {
    let breaks = this.props.data.breaks.slice()

    for(let i = 0; i < breaks.length; i++){
      // check if the break overlaps with any preexisting breaks
      if(
        (
          TimeCalc.isBiggerThan(endTime, breaks[i].startTime, false, true) &&
          TimeCalc.isBiggerThan(breaks[i].startTime, startTime, true, true)
        ) || (
          TimeCalc.isBiggerThan(endTime, breaks[i].endTime, false, true) &&
          TimeCalc.isBiggerThan(breaks[i].endTime, startTime, true, true)
        )
      ){

        // if the overlapping break was also autodetected, merge the two
        if(breaks[i].autodetected){

          // if the other break's startTime is earlier than the new break's start time...
          if(TimeCalc.isBiggerThan(startTime, breaks[i].startTime, false, true)){
            // set the startTime to be equal to the previous startTime
            startTime = breaks[i].startTime
          }

          // if the other break's endTime is later that the current one...
          if(TimeCalc.isBiggerThan(breaks[i].endTime, endTime, true, true)){
            endTime = breaks[i].endTime
          }

          // finally, remove the other break as it's no longer needed (it'll be merged into the new one)
          breaks.splice(i, 1)
        }

        // if the break was manually inserted, move the startTime after the other break
        else {
          startTime = breaks[i].endTime
        }
      }
    }

    let newId = makeNewId(breaks, "breaks")

    breaks.push({
      id: newId,
      name: "Auto " + (breaks.length + 1),
      autodetected: true,
      startTime, endTime
    })

    this.props.update({breaks}, {breaks: newId})
    return breaks
  }

  handleModeChange(val){
    // don't let the user go into work mode if there isn't an endTime or if projects are empty  (+ show an error)
    if(val === "working"){
      if(this.props.data.endTime.h === "" || this.props.data.endTime.m === ""){
        this.setState({showErrors: {...this.state.showErrors, endTime: true}})
        return
      }
      if(!this.props.data.projects.length){
        this.setState({showErrors: {...this.state.showErrors, noProjects: true}})
        return
      }
    }

    this.props.update({mode: val})
  }

  handleEndTimeChange(id, val){
    let endTime = Object.assign({}, this.props.data.endTime)
    let newState = {
      showErrors: this.state.showErrors,
      temp: this.state.temp
    }

    if(id === "object") endTime = val
    else endTime[id] = val

    // show/hide error
    if(endTime.h === ""
      || endTime.m === ""
      || TimeCalc.isBiggerThan(this.state.currentTime, endTime, true, true)
    ){
      newState.temp.endTimeErrorTimeout = setTimeout(() => {
        this.setState({showErrors: {...this.state.showErrors, endTime: true}})
      }, 250)
    }
    else{
      clearTimeout(newState.temp.endTimeErrorTimeout)
      newState.showErrors.endTime = false
    }

    newState.endTime = endTime

    this.setState(newState)
    this.props.update({endTime})
  }

  handleAddProject(project, newDefaultColorIndex){
    // hide the noProjects error
    this.setState({showErrors: {...this.state.showErrors, noProjects: false}})

    // copy the state
    let projects = this.props.data.projects.slice()
    let settings = this.props.data.settings

    // make a new unique ID
    let newId = makeNewId(projects, "projects")

    // convert
    let newProject = {
      id: newId,
      name: project.name,
      color: project.color,
      estimatedDuration: project.duration,
      plannedTime: {
        start: project.startTime,
        end: TimeCalc.add(project.startTime, project.duration)
      },
      state:'notStarted'
    }

    // if the startTime is larger that the suggested time, add a new break
    if(projects.length){ // don't execute if there are no previous projects
      let currentLastProject = projects[projects.length - 1]
      if(
        settings.detectBreaksAutomatically &&
        TimeCalc.isBiggerThan(project.startTime,
          TimeCalc.suggestStartTime(currentLastProject.plannedTime.end, currentLastProject.estimatedDuration, settings),
          false, true
        )
      ){
        this.addBreak(currentLastProject.plannedTime.end, project.startTime)
      }
    }

    // create the newState object , handle undefined for newDefaultColorIndex
    projects.push(newProject)
    let newState = {projects}
    if(newDefaultColorIndex) newState.defaultColorIndex = newDefaultColorIndex

    // if it's the first project being added, save the startTime as well
    if(projects.length === 1) newState.startTime = projects[0].plannedTime.start

    // save to state
    this.props.update(newState, {projects: newId})
  }

  handleDeleteProject(id){
    let projects = this.props.data.projects.slice()
    let settings = this.props.data.settings

    let index = projects.findIndex(project => project.id === id)

    // if we are updating the timing and if the deleted project is the first one, adjust the next startTime
    if(settings.updateTimesAfterDelete && index === 0 && projects[1]){
      projects[1].plannedTime.start = projects[0].plannedTime.start
    }

    projects.splice(index, 1)

    if(settings.updateTimesAfterDelete) projects = setTimesForProjects(projects, settings, this.props.data.breaks, this.props.data.startTime)

    let newState = {projects}

    // if the user just deleted the last remaining project, reset breaks as well
    if(!projects.length) newState.breaks = []

    this.props.update(newState, {projects: id})
  }

  // switch mode on tab
  handleRootKeyDown(e){
    if(this.props.data.settings.changeModeOnTab && e.key === "Tab" && !this.state.temp.openBreaksDrawer){
      e.preventDefault()

      this.handleModeChange(this.props.data.mode === "planning" ? "working" : "planning")
    }
  }

  handleColorChange(id, val){
    let projects = this.props.data.projects.slice()

    let index = projects.findIndex(project => project.id === id)

    // break the reference
    let changedProject = Object.assign({}, projects[index])
    projects.splice(index, 1)

    changedProject.color = val

    projects.splice(index, 0, changedProject)

    this.props.update({projects}, {projects: id})
  }

  handleDragEnd(result){
    this.setState({temp: {...this.state.temp, dragging: false}})

    // handle the draggable being drop outside the droppable
    if(!result.destination) return

    let id = result.draggableId
    let index = result.destination.index
    let projects = []
    this.props.data.projects.forEach(project => {
      let copy = Object.assign({}, project)
      copy.plannedTime = JSON.parse(JSON.stringify(project.plannedTime))
      projects.push(copy)
    })

    let movedProjectIndex = projects.findIndex(el => el.id === parseInt(id))
    let movedProject = projects[movedProjectIndex]

    // if the project was dropped at the same spot it was picked up from, stop executing
    if(index === movedProjectIndex) return

    // store the startTime of the project that is currently first
    // (for the setTimesForProjects function to work properly)
    let firstStartTime = projects[0].plannedTime.start

    // remove from the current position
    projects.splice(movedProjectIndex, 1)

    // add to the new position
    projects.splice(index, 0, movedProject)

    if(this.props.data.settings.updateTimesAfterDrag){
      projects[0].plannedTime.start = firstStartTime

      projects = setTimesForProjects(projects, this.props.data.settings, this.props.data.breaks, this.props.data.startTime)
    }

    // save
    this.props.update({projects})
  }

  handleDoneEditingProject(id, values){
    let projects = this.props.data.projects.slice()
    let breaks = this.props.data.breaks
    let settings = this.props.data.settings

    let index = projects.findIndex(project => project.id === id)

    // break the reference (keep the reference for plannedTime if it hasn't changed)
    let changedProject = {}
    Object.keys(projects[index]).forEach(key => {
      changedProject[key] = projects[index][key]
    })

    // if we're changing something about the timing, break the reference to plannedTime too
    if(
      changedProject.estimatedDuration !== values.duration ||
      !TimeCalc.areIdentical(changedProject.plannedTime.start, values.startTime)
    ){
      changedProject.plannedTime = Object.assign({}, changedProject.plannedTime)
    }

    projects.splice(index, 1) // breaking the reference pt. 2

    // if the user increased the startTime, save a new break
    if(
      settings.detectBreaksAutomatically &&
      index !== 0 &&
      TimeCalc.isBiggerThan(values.startTime, changedProject.plannedTime.start, false, true)
    ){
      breaks = this.addBreak(
        TimeCalc.suggestStartTime(projects[index - 1].plannedTime.end, projects[index - 1].estimatedDuration, settings),
        values.startTime
      )
    }

    // if the user decreased the startTime, check to see if any breaks need to adjusted
    if(
      settings.detectBreaksAutomatically &&
      index !== 0 &&
      TimeCalc.isBiggerThan(changedProject.plannedTime.start, values.startTime, false, true)
    ){
      for(let i = 0; i < breaks.length; i++){
        // if an autodetected break was previously right before the project being editted, adjust it
        if(
          breaks[i].autodetected &&
          TimeCalc.areIdentical(changedProject.plannedTime.start, breaks[i].endTime)
        ){
          breaks[i].endTime = values.startTime
        }
      }
    }

    // check if any time values were changed (so that we don't unnecessarily recalculate project times)
    let durationChanged = parseInt(changedProject.estimatedDuration) !== parseInt(values.duration)
    let startTimeChanged = !TimeCalc.areIdentical(changedProject.plannedTime.start, values.startTime)

    // change the values
    changedProject.name = values.name
    changedProject.estimatedDuration = values.duration
    changedProject.plannedTime.start = values.startTime

    // insert the changedProject back into the array
    projects.splice(index, 0, changedProject)

    let changes // what was modified

    // if the user wants to update all times, do so
    if(this.props.data.settings.updateTimesAfterEdit && (durationChanged || startTimeChanged)){
      // break the references of all projects after the one that was changed (their times will be changed)
      for(let i = index + 1; i < projects.length; i++){
        projects[i] = Object.assign({}, projects[i])
        projects[i].plannedTime = Object.assign({}, projects[i].plannedTime)
      }

      let startTime = index === 0 ? values.startTime : Object.assign({}, this.props.data.startTime)
      projects = setTimesForProjects(projects, settings, breaks, startTime)
    }

    // else simply adjust the endTime
    else{
      changes = {projects: id}
      projects[index].plannedTime.end = TimeCalc.add(projects[index].plannedTime.start, projects[index].estimatedDuration)
    }

    // create the newState object
    let newState = {projects}

    // if the startTime of the first project was changed, adjust this.props.data.startTime accordingly
    if(index === 0 && !TimeCalc.areIdentical(this.props.data.startTime, changedProject.plannedTime.start)){
      newState.startTime = changedProject.plannedTime.start
    }

    // save to state
    this.props.update(newState, changes)
  }

  handleProjectStateChange(id, val, progress){
    let projects = this.props.data.projects.slice()

    let index = projects.findIndex(project => project.id === id)

    // break the reference
    let changedProject = Object.assign({}, projects[index])
    projects.splice(index, 1)

    // set the state of the changed project
    changedProject.state = val

    // if it's being paused, set progress
    if(val === "paused" && !isNaN(parseInt(progress))) changedProject.progress = progress

    // if it's being changed to workingOnIt, save current time
    if(val === "workingOnIt") changedProject.startedWorkingOnIt = this.state.currentTime

    let changes = {projects: [id]}

    // loop through the other projects
    // if the project's state is being changed to workingOnIt, pause any other projects with the same state
    projects.map((project, i) => {
      if(val === "workingOnIt" && project.state === "workingOnIt" && project.id !== id){
        projects[i] = {...project, state: "paused"} // break the reference
        changes.projects.push(project.id)
        return projects[i]
      }

      return project
    })

    projects.splice(index, 0, changedProject)

    this.props.update({projects}, changes)
  }

  handleCurrentTimeChange(time){
    this.setState({currentTime: time})
  }

  resetState(){
    if(window.confirm("Are you sure you want to delete all your projects?")){
      this.props.update({
        projects: [],
        breaks: [],
        mode: "planning",
        productivityPercentage: undefined
      })
      this.setState({showResetButton: false})
    }
  }

  handleEndTimeValidation(success){
    this.setState({showErrors: {...this.state.showErrors, endTime:success}})
  }

  openBreaksDrawer(){
    this.setState({temp: {...this.state.temp, openBreaksDrawer: true}})
  }

  closeBreaksDrawer = () => {
    if(typeof this.state.temp.canCloseBreaksDrawer === "undefined" ||
      this.state.temp.canCloseBreaksDrawer ||
      window.confirm("Some of the breaks weren't editted properly. If you close this now, those changes will be lost")
    ) this.setState({temp: {...this.state.temp, openBreaksDrawer: false, canCloseBreaksDrawer: undefined}})
  }

  saveBreaks(breaks, canClose, changes){
    if(typeof canClose === "undefined" || canClose){
      let projects = this.props.data.projects.slice()
      if(this.props.data.projects.length){
        projects = setTimesForProjects(projects, this.props.data.settings, breaks, this.props.data.startTime)
      }

      let temp = this.state.temp
      if(typeof canClose !== "undefined") temp.canCloseBreaksDrawer = canClose

      this.setState({temp})
      this.props.update({projects, breaks: JSON.parse(JSON.stringify(breaks))}, changes)
    }
    else this.setState({temp: {...this.state.temp, canCloseBreaksDrawer: false}})
  }

  handleSignInDismiss = () => {
    this.setState({temp: {...this.state.temp, signInDissmissed: true}})
    localStorage.userHasDismissedSignInBefore = true

    // show the panel again in 30 minutes
    setTimeout(() => {
      this.setState({temp: {...this.state.temp, signInDissmissed: null}})
    }, 30*60*1000)
  }

  handleSignInDontRemindMeAgain = () => {
    this.setState({temp: {...this.state.temp, signInDissmissed: null}})
    localStorage.removeItem("userHasDismissedSignInBefore")
    localStorage.dontShowSignInPanelAgain = true
  }

  render() {
    let {allProjectsDone, totalTimeWorkedString} = this.state
    let productivityPercentage = this.props.data.productivityPercentage

    return (
      <Grid
        className="App"
        onKeyDown={this.handleRootKeyDown.bind(this)}
        tabIndex="0">
        <ModeSwitch
          mode={this.props.data.mode}
          onModeChange={this.handleModeChange.bind(this)}>
          <TimeStats
            currentTime={this.state.currentTime}
            onCurrentTimeChange={this.handleCurrentTimeChange.bind(this)}
            endTime={this.props.data.endTime}
            projects={this.props.data.projects}
            breaks={this.props.data.breaks}
            settings={this.props.data.settings}
          />
        </ModeSwitch>
        <Grid container>
          <SettingsContext.Provider value={this.props.data.settings}>
            <ProjectsTable
              mode={this.props.data.mode}
              projects={this.props.data.projects}
              settings={this.props.data.settings}
              currentTime={this.state.currentTime}
              defaultColorIndex={this.props.data.defaultColorIndex}
              showErrors={this.state.showErrors}
              onColorChange={this.handleColorChange.bind(this)}
              onDoneEditing={this.handleDoneEditingProject.bind(this)}
              onAddProject={this.handleAddProject.bind(this)}
              onProjectStateChange={this.handleProjectStateChange.bind(this)}
              onDeleteProject={this.handleDeleteProject.bind(this)}
              onDragEnd={this.handleDragEnd.bind(this)}/>
            {
              this.props.data.mode === "planning" ?
              // planning mode
              (
                <React.Fragment>
                  <div id="setEndTime">
                    <label htmlFor="endTimeHoursInput">
                      Time when you want to stop working:
                    </label>
                    <TimeSetter
                      onChange={this.handleEndTimeChange.bind(this)}
                      value={this.props.data.endTime}
                      firstInputId="endTimeHoursInput"
                      showError={this.state.showErrors.endTime}
                    />
                  </div>
                  <Grid container justify="space-evenly">
                    <Grid>
                      <Button
                        onClick={this.openBreaksDrawer.bind(this)}
                        /*variant="contained"*/
                        style={{marginBottom: "1rem"}}>
                        <PauseIcon color="primary" />
                        Set/Edit breaks
                      </Button>
                    </Grid>
                    <Grid>
                      <Button
                        onClick={this.handleModeChange.bind(this, "working")}
                        variant="contained"
                        color="primary">
                        <StartIcon />
                        Let's get to work!
                      </Button>
                    </Grid>
                  </Grid>
                  <Drawer id="BreaksDrawer" anchor="bottom" open={this.state.temp.openBreaksDrawer} onClose={this.closeBreaksDrawer}>
                    <BreaksDrawer
                      breaks={this.props.data.breaks}
                      currentTime={this.state.currentTime}
                      onSave={this.saveBreaks.bind(this)}
                      onClose={this.closeBreaksDrawer}
                    />
                  </Drawer>
                </React.Fragment>
              )
              :
              // working mode
              (
                allProjectsDone && (
                  <div id="congratsDiv">
                    <span id="congrats">
                      CONGRATULATIONS!
                    </span>
                    <br/>
                    You got {totalTimeWorkedString} worth of work done
                    <br/>
                    {
                      productivityPercentage >= 0 && productivityPercentage <= 100 &&(
                        <span>
                          You were productive {productivityPercentage}% of the time
                        </span>
                      )
                    }
                  </div>
                )
              )
            }
            {this.state.showResetButton && (
              <Grid container justify="flex-end" alignItems="flex-end" style={{marginTop: "2rem"}}>
                <Button
                  onClick={this.resetState.bind(this)}
                  variant="contained">
                  Reset
                </Button>
              </Grid>
            )}
          </SettingsContext.Provider>
        </Grid>
        <Link id="linkToSettings" to="/settings" aria-label="Settings" title="Settings">
          <SettingsIcon />
        </Link>
        <Slide
          direction="right"
          in={
            !this.props.loggedIn &&
            !this.state.temp.dontShowSignInYet &&
            !this.state.temp.signInDissmissed &&
            !localStorage.dontShowSignInPanelAgain
          }
          mountOnEnter unmountOnExit
        >
          <SignInPanel
            connect={this.props.connect}
            dismiss={this.handleSignInDismiss}
            showDontRemindMeAgain={localStorage.userHasDismissedSignInBefore}
            dontRemindMeAgain={this.handleSignInDontRemindMeAgain}
          />
        </Slide>
        <DropdownMenu
          connect={this.props.connect}
          disconnect={this.props.disconnect}
          history={this.props.history}
          loggedIn={this.props.loggedIn}
        />
      </Grid>
    );
  }
}
