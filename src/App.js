import React, { Component } from 'react';
import ModeSwitch from './ModeSwitch'
import ProjectsTable from './ProjectsTable'
import EndTimeSetter from './EndTimeSetter'
import TimeStats from './TimeStats'
import BreaksDrawer from './BreaksDrawer'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import { Link } from "react-router-dom";
import SettingsIcon from '@material-ui/icons/Settings';
import HelpIcon from '@material-ui/icons/Help';
import TimeCalc, { setTimesForProjects } from './util/TimeCalc'
import { SettingsContext } from './_Context'

export default class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      projects: [],
      breaks: [],
      mode: "planning",
      startTime: {},
      endTime: {
        h: 11,
        m: "00",
        pm: true
      },
      currentTime: {
        h: 0,
        m: 0,
        pm: true
      },
      settings: this.props.settings,
      showErrors: {
        endTime: false,
        noProjects: false
      },
      showResetButton: false,
      defaultColorIndex: undefined,
      temp: {}
    }
  }

  componentDidMount(){
    // get data from localStorage
    let projects, breaks, startTime, endTime, mode

    // handle undefined, set defaults
    try {
      projects = JSON.parse(localStorage.projects)
    } catch (e) {
      projects = []
    }

    try {
      breaks = JSON.parse(localStorage.breaks)
    } catch (e) {
      breaks = []
    }

    try {
      startTime = JSON.parse(localStorage.startTime)
    } catch (e) {
      startTime = {h: 2, m: "00", pm: true}
    }

    try {
      endTime = JSON.parse(localStorage.endTime)
    } catch (e) {
      endTime = {h: 11, m: "00", pm: true}
    }

    try {
      mode = JSON.parse(localStorage.mode)
    } catch (e) {
      mode = "planning"
    }

    let defaultColorIndex = localStorage.defaultColorIndex ? localStorage.defaultColorIndex : 0

    this.setState({projects, breaks, startTime, endTime, mode, defaultColorIndex})
  }

  componentDidUpdate(){
    // only update if it's the init with data from localStorage
    if(!Object.keys(this.state.settings).length && this.props.settings){
      this.setState({settings: this.props.settings})
      this.setShowResetButton()
    }

    // save to localStorage
    localStorage.projects = JSON.stringify(this.state.projects)
    localStorage.breaks = JSON.stringify(this.state.breaks)
    localStorage.startTime = JSON.stringify(this.state.startTime)
    localStorage.endTime = JSON.stringify(this.state.endTime)
    localStorage.mode = JSON.stringify(this.state.mode)
    localStorage.defaultColorIndex = this.state.defaultColorIndex

    // save the time of the last time when there were no projects (to let the app offer to clear projects after midnight)
    if(!this.state.projects.length){
      localStorage.lastReset = new Date()
      localStorage.removeItem("productivityPercentage")
    }
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
      let settings = this.state.settings.showResetButtonAfter ? this.state.settings : this.props.settings
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
    let breaks = this.state.breaks

    // find the highest id
    let highestId = -1
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

      // looking for the highest ID
      // (first check if the break wasn't deleted)
      if(breaks[i] && breaks[i].id > highestId) highestId = breaks[i].id
    }

    // assign an id one bigger than the current biggest one
    let newId = highestId + 1

    breaks.push({
      id: newId,
      name: "Auto " + (newId + 1),
      autodetected: true,
      startTime, endTime
    })

    this.setState({breaks})
    return breaks
  }

  handleModeChange(val){
    // don't let the user go into work mode if there isn't an endTime or if projects are empty  (+ show an error)
    if(val === "working"){
      if(this.state.endTime.h === "" || this.state.endTime.m === ""){
        this.setState({showErrors: {...this.state.showErrors, endTime: true}})
        return
      }
      if(!this.state.projects.length){
        this.setState({showErrors: {...this.state.showErrors, noProjects: true}})
        return
      }
    }

    this.setState({mode: val})
  }

  handleEndTimeChange(id, val){
    let newState = {endTime: this.state.endTime, showErrors: this.state.showErrors, temp: this.state.temp}
    newState.endTime[id] = val

    // show/hide error
    if(newState.endTime.h === ""
      || newState.endTime.m === ""
      || !TimeCalc.isBiggerThan(newState.endTime, this.state.currentTime, true, true)
    ){
      newState.temp.endTimeErrorTimeout = setTimeout(() => {
        this.setState({showErrors: {...this.state.showErrors, endTime: true}})
      }, 250)
    }
    else{
      clearTimeout(newState.temp.endTimeErrorTimeout)
      newState.showErrors.endTime = false
    }

    this.setState(newState)
  }

  handleAddProject(project, newDefaultColorIndex){
    // hide the noProjects error
    this.setState({showErrors: {...this.state.showErrors, noProjects: false}})

    // copy the state
    let projects = this.state.projects
    let settings = this.state.settings

    // find the highest id in projects
    let highestId = -1
    for(let i = 0; i < projects.length; i++) if(projects[i].id > highestId) highestId = projects[i].id

    // assign an id one bigger than the current biggest one
    // (if there are no projects yet then highestId stayed at -1, therefore newId will be 0)
    let newId = highestId + 1

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
    this.setState(newState)
  }

  handleDeleteProject(id){
    let projects = this.state.projects
    let settings = this.state.settings

    let index = projects.findIndex(project => project.id === id)

    // if we are updating the timing and if the deleted project is the first one, adjust the next startTime
    if(settings.updateTimesAfterDelete && index === 0 && projects[1]){
      projects[1].plannedTime.start = projects[0].plannedTime.start
    }

    projects.splice(index, 1)

    if(settings.updateTimesAfterDelete) projects = setTimesForProjects(projects, settings, this.state.breaks, this.state.startTime)

    let newState = {projects}

    // if the user just deleted the last remaining project, reset breaks as well
    if(!projects.length) newState.breaks = []

    this.setState(newState)
  }

  // switch mode on tab
  handleRootKeyDown(e){
    if(this.state.settings.changeModeOnTab && e.key === "Tab" && !this.state.temp.openBreaksDrawer){
      e.preventDefault()

      this.handleModeChange(this.state.mode === "planning" ? "working" : "planning")
    }
  }

  handleColorChange(id, val){
    let projects = this.state.projects
    let index = projects.findIndex(project => project.id === id)
    projects[index].color = val
    this.setState({projects})
  }

  handleDragEnd(result){
    this.setState({temp: {...this.state.temp, dragging: false}})

    if(!result.destination) console.log(result);
    // handle the draggable being drop outside the droppable
    if(!result.destination) return

    let id = result.draggableId
    let index = result.destination.index
    let projects = this.state.projects

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

    if(this.state.settings.updateTimesAfterDrag){
      projects[0].plannedTime.start = firstStartTime

      projects = setTimesForProjects(projects, this.state.settings, this.state.breaks, this.state.startTime)
    }

    // save
    this.setState({projects})
  }

  handleDoneEditingProject(id, values){
    let projects = this.state.projects
    let breaks = this.state.breaks
    let settings = this.state.settings

    let index = projects.findIndex(project => project.id === id)

    // if the user increased the startTime, save a new break
    if(
      settings.detectBreaksAutomatically &&
      index !== 0 &&
      TimeCalc.isBiggerThan(values.startTime, projects[index].plannedTime.start, false, true)
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
      TimeCalc.isBiggerThan(projects[index].plannedTime.start, values.startTime, false, true)
    ){
      for(let i = 0; i < breaks.length; i++){
        // if an autodetected break was previously right before the project being editted, adjust it
        if(
          breaks[i].autodetected &&
          TimeCalc.areIdentical(projects[index].plannedTime.start, breaks[i].endTime)
        ){
          breaks[i].endTime = values.startTime
        }
      }
    }

    // check if any time values were changed (so that we don't unnecessarily recalculate project times)
    let durationChanged = parseInt(projects[index].estimatedDuration) !== parseInt(values.duration)
    let startTimeChanged = !TimeCalc.areIdentical(projects[index].plannedTime.start, values.startTime)

    // change the values
    projects[index].name = values.name
    projects[index].estimatedDuration = values.duration
    projects[index].plannedTime.start = values.startTime

    // if the user wants to update all times, do so
    if(this.state.settings.updateTimesAfterEdit && (durationChanged || startTimeChanged)){
      let startTime = index === 0 ? values.startTime : this.state.startTime
      projects = setTimesForProjects(projects, settings, breaks, startTime)
    }

    // else simply adjust the endTime
    else projects[index].plannedTime.end = TimeCalc.add(projects[index].plannedTime.start, projects[index].estimatedDuration)

    // create the newState object
    let newState = {projects}

    // if the startTime of the first project was changed, adjust this.state.startTime accordingly
    if(index === 0) newState.startTime = projects[index].plannedTime.start

    // save to state
    this.setState(newState)
  }

  handleProjectStateChange(id, val, progress){
    let projects = this.state.projects

    projects.map(project => {
      // set the state of the changed project
      if(project.id === id){
        project.state = val

        // if it's being paused, set progress
        if(val === "paused" && !isNaN(parseInt(progress))) project.progress = progress

        // if it's being changed to workingOnIt, save current time
        if(val === "workingOnIt") project.startedWorkingOnIt = this.state.currentTime
      }

      // if a project's state is being changed to workingOnIt, pause any other projects with the same state
      if(val === "workingOnIt" && project.state === "workingOnIt" && project.id !== id) project.state = "paused"

      return project
    })

    this.setState({projects})
  }

  handleCurrentTimeChange(time){
    this.setState({currentTime: time})
  }

  resetState(){
    if(window.confirm("Are you sure you want to delete all your projects?")){
      this.setState({projects: [], breaks: [], mode: "planning", showResetButton: false})
    }
  }

  handleEndTimeValidation(success){
    let showErrors = this.state.showErrors
    showErrors.endTime = success
    this.setState({showErrors})
    console.log({showErrors: {...this.state.showErrors, endTime:success}});
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

  saveBreaks(breaks, canClose){
    if(typeof canClose === "undefined" || canClose){
      let projects = this.state.projects
      if(this.state.projects.length){
        projects = setTimesForProjects(projects, this.state.settings, breaks, this.state.startTime)
      }

      let temp = this.state.temp
      if(typeof canClose !== "undefined") temp.canCloseBreaksDrawer = canClose

      this.setState({projects, breaks: JSON.parse(JSON.stringify(breaks)), temp})
    }
    else this.setState({temp: {...this.state.temp, canCloseBreaksDrawer: false}})
  }

  render() {
    // speed up the load (wouldn't make sense to do all the processing if there are no projects)
    let allProjectsDone = false
    let productivityPercentage, totalTimeWorkedString

    if(this.state.projects.length){
      allProjectsDone = true
      for(let i = 0; i < this.state.projects.length; i++){
        if(this.state.projects[i].state !== "done"){
          allProjectsDone = false
          break
        }
      }

      if(allProjectsDone){
        let totalTimeWorked = 0

        for(let i = 0; i < this.state.projects.length; i++) totalTimeWorked += parseInt(this.state.projects[i].estimatedDuration)

        if(totalTimeWorked >= 60) totalTimeWorkedString = TimeCalc.makeString(TimeCalc.toTimeObject(totalTimeWorked, false), false)
        else totalTimeWorkedString += " minutes"

        // if the productivityPercentage was already stored, use it
        if(localStorage.productivityPercentage){
          productivityPercentage = localStorage.productivityPercentage
        }
        // else calculate and store it
        else {
          let totalTimePassed = TimeCalc.subtractToMinutes(this.state.currentTime, this.state.startTime, true)
          productivityPercentage = Math.round(100 * totalTimeWorked / totalTimePassed)
          localStorage.productivityPercentage = productivityPercentage
        }
      }

      else localStorage.removeItem("productivityPercentage")
    }
    else allProjectsDone = false

    return (
      <Grid
        className="App"
        onKeyDown={this.handleRootKeyDown.bind(this)}
        tabIndex="0">
        <ModeSwitch
          mode={this.state.mode}
          onModeChange={this.handleModeChange.bind(this)}>
          <TimeStats
            currentTime={this.state.currentTime}
            onCurrentTimeChange={this.handleCurrentTimeChange.bind(this)}
            endTime={this.state.endTime}
            projects={this.state.projects}
            breaks={this.state.breaks}
            settings={this.state.settings}
          />
        </ModeSwitch>
        <Grid container>
          <SettingsContext.Provider value={this.state.settings}>
            <ProjectsTable
              mode={this.state.mode}
              projects={this.state.projects}
              settings={this.state.settings}
              currentTime={this.state.currentTime}
              defaultColorIndex={this.state.defaultColorIndex}
              showErrors={this.state.showErrors}
              onColorChange={this.handleColorChange.bind(this)}
              onDoneEditing={this.handleDoneEditingProject.bind(this)}
              onAddProject={this.handleAddProject.bind(this)}
              onProjectStateChange={this.handleProjectStateChange.bind(this)}
              onDeleteProject={this.handleDeleteProject.bind(this)}
              onDragEnd={this.handleDragEnd.bind(this)}/>
            {
              this.state.mode === "planning" ?
              // planning mode
              (
                <React.Fragment>
                  <EndTimeSetter
                    onChange={this.handleEndTimeChange.bind(this)}
                    value={this.state.endTime}
                    showError={this.state.showErrors.endTime}/>
                  <Grid container justify="center">
                    <Button
                      onClick={this.openBreaksDrawer.bind(this)}
                      variant="contained"
                      style={{marginBottom: "1rem"}}>
                      Set/Edit breaks
                    </Button>
                  </Grid>
                  <Grid container justify="center">
                    <Button
                      onClick={this.handleModeChange.bind(this, "working")}
                      variant="contained"
                      color="primary">
                      Let's get to work!
                    </Button>
                  </Grid>
                  <Drawer id="BreaksDrawer" anchor="bottom" open={this.state.temp.openBreaksDrawer} onClose={this.closeBreaksDrawer}>
                    <BreaksDrawer
                      breaks={this.state.breaks}
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
                    You were productive {productivityPercentage}% of the time
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
        <Link id="linkToAbout" to="/about" aria-label="About" title="About">
          <HelpIcon />
        </Link>
      </Grid>
    );
  }
}
