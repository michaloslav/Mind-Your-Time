import React, { Component } from 'react';
import AddProjectView from "./MobileViews/AddProjectView"
import EditProjectView from "./MobileViews/EditProjectView"
import BreaksView from "./MobileViews/BreaksView"
import DefaultProjectsView from "./MobileViews/DefaultProjectsView"
import ModeSwitch from './ModeSwitch'
import ProjectsTable from './ProjectsTable'
import TimeSetter from './TimeSetter'
import TimeStats from './TimeStats'
import BreaksDrawer from './BreaksDrawer'
import DefaultProjectsDrawer from './DefaultProjectsDrawer'
import SignInPanel from './SignInPanel'
import DropdownMenu from './DropdownMenu'
import AddFab from './AddFab'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import Slide from '@material-ui/core/Slide';
import { Link } from "react-router-dom";
import SettingsIcon from '@material-ui/icons/Settings';
import PauseIcon from '@material-ui/icons/Pause';
import StartIcon from '@material-ui/icons/PlayArrow';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import TimeCalc, { setTimesForProjects } from './util/TimeCalc'
import makeNewId from './util/makeNewId'
import getGetParams from './util/getGetParams'
import { SettingsContext, IsMobileContext } from './_Context'
import './css/App.css'

export default class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      showErrors: {},
      showResetButton: false,
      temp: {
        dontShowSignInYet: true
      }
    }

    // only show the sign in panel after a little while
    this.showSignInPanelAfterLoadTimeout = setTimeout(() => {
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
          let totalTimePassed = TimeCalc.subtractToMinutes(this.props.currentTime, this.props.data.startTime, true)
          productivityPercentage = Math.round(100 * totalTimeWorked / totalTimePassed)
        }
      }
    }
    else allProjectsDone = false

    if(allProjectsDone !== this.state.allProjectsDone) this.setState({allProjectsDone})
    if(totalTimeWorkedString !== this.state.totalTimeWorkedString) this.setState({totalTimeWorkedString})
    if(
      productivityPercentage !== this.props.data.productivityPercentage &&
      !(isNaN(productivityPercentage) && typeof productivityPercentage === "number") // handle NaN
    ) this.props.update({productivityPercentage})
  }

  componentWillUnmount(){
    clearTimeout(this.showSignInAgainTimeout)
    clearTimeout(this.showSignInPanelAfterLoadTimeout)
  }

  // internal method, used in componentDidMount and componentDidUpdate
  setShowResetButton = () => {
    let condition1, condition2

    // show the reset button if 5AM is between lastReset and currentTime
    let lastResetInMs = new Date(localStorage.lastReset).getTime() // ms since 1970
    lastResetInMs = lastResetInMs % (24*60*60*1000)
    let lastResetInMinutes = lastResetInMs / 1000 / 60
    condition1 = TimeCalc.isBiggerThan(lastResetInMinutes, this.props.currentTime, false, true)

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
    let showResetButton = (condition1 || condition2) && this.props.data.projects.length
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

  handleEndTimeChange = (id, val) => {
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
      || TimeCalc.isBiggerThan(this.props.currentTime, endTime, true, true)
    ){
      newState.temp.endTimeErrorTimeout = setTimeout(() => {
        this.props.changeRouterShowErrors("endTime", true)
      }, 250)
    }
    else{
      clearTimeout(newState.temp.endTimeErrorTimeout)
      this.props.changeRouterShowErrors("endTime", false)
    }

    newState.endTime = endTime

    this.setState(newState)
    this.props.update({endTime})
  }

  addProject(arrayId, project, newDefaultColorIndex){
    // hide the noProjects error, hide the temp var
    this.props.changeRouterShowErrors("noProjects", false)

    // copy the state
    let projects = this.props.data[arrayId].slice()
    let settings = this.props.data.settings

    // make a new unique ID
    let newId = makeNewId(projects, "projects")

    // convert
    let newProject = {
      id: newId,
      name: project.name,
      color: project.color,
      estimatedDuration: project.duration,
      state:'notStarted'
    }
    if(arrayId !== "defaultProjects"){ // don't add the plannedTime property if we're editting the defaultProjects
      newProject.plannedTime = {
        start: project.startTime,
        end: TimeCalc.add(project.startTime, project.duration)
      }
    }

    // if the startTime is larger that the suggested time, add a new break
    // (don't execute if there are no previous projects or if it's defaultProjects)
    if(projects.length && arrayId !== "defaultProjects"){
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
    let newState = {[arrayId]: projects}
    if(typeof newDefaultColorIndex !== "undefined"){
      let defaultColorIndexKey = arrayId === "projects" ? "defaultColorIndex" : "defaultColorIndexDefaultProjects"
      newState[defaultColorIndexKey] = newDefaultColorIndex
    }

    // if it's the first project being added, save the startTime as well
    if(projects.length === 1 && arrayId !== "defaultProjects") newState.startTime = projects[0].plannedTime.start

    // save to state
    this.props.update(newState, {[arrayId]: newId})
  }

  deleteProject(arrayId, id){
    let projects = this.props.data[arrayId].slice()
    let settings = this.props.data.settings

    let index = projects.findIndex(project => project.id === parseInt(id))

    // if we are updating the timing and if the deleted project is the first one, adjust the next startTime
    if(settings.updateTimesAfterDelete && index === 0 && projects[1] && arrayId !== "defaultProjects"){
      projects[1].plannedTime.start = projects[0].plannedTime.start
    }

    projects.splice(index, 1)

    if(settings.updateTimesAfterDelete && arrayId !== "defaultProjects"){
      projects = setTimesForProjects(projects, settings, this.props.data.breaks, this.props.data.startTime)
    }

    let newState = {[arrayId]: projects}

    // if the user just deleted the last remaining project, reset breaks as well
    if(!projects.length && arrayId !== "defaultProjects") newState.breaks = []

    this.props.update(newState, {[arrayId]: id})
  }

  // switch mode on Tab press
  handleRootKeyDown = e => {
    if(this.props.data.settings.changeModeOnTab && e.key === "Tab" && !this.state.temp.openBreaksDrawer){
      e.preventDefault()

      this.props.changeMode(this.props.data.mode === "planning" ? "working" : "planning")
    }
  }

  handleColorChange(arrayId, id, val){
    let projects = this.props.data[arrayId].slice()

    let index = projects.findIndex(project => project.id === parseInt(id))

    // break the reference
    let changedProject = Object.assign({}, projects[index])
    projects.splice(index, 1)

    changedProject.color = val

    projects.splice(index, 0, changedProject)

    this.props.update({[arrayId]: projects}, {projects: id})
  }

  handleDragEnd(arrayId, result){
    this.setState({temp: {...this.state.temp, dragging: false}})

    // handle the draggable being drop outside the droppable
    if(!result.destination) return

    let id = result.draggableId
    let index = result.destination.index
    let projects = []
    this.props.data[arrayId].forEach(project => {
      let copy = Object.assign({}, project)
      if(arrayId !== "defaultProjects"){
        copy.plannedTime = JSON.parse(JSON.stringify(project.plannedTime))
      }
      projects.push(copy)
    })

    let movedProjectIndex = projects.findIndex(el => el.id === parseInt(id))
    let movedProject = projects[movedProjectIndex]

    // if the project was dropped at the same spot it was picked up from, stop executing
    if(index === movedProjectIndex) return

    // store the startTime of the project that is currently first
    // (for the setTimesForProjects function to work properly)
    let firstStartTime
    if(arrayId !== "defaultProjects") firstStartTime = projects[0].plannedTime.start

    // remove from the current position
    projects.splice(movedProjectIndex, 1)

    // add to the new position
    projects.splice(index, 0, movedProject)

    if(this.props.data.settings.updateTimesAfterDrag && arrayId !== "defaultProjects"){
      projects[0].plannedTime.start = firstStartTime

      projects = setTimesForProjects(projects, this.props.data.settings, this.props.data.breaks, this.props.data.startTime)
    }

    // save
    this.props.update({[arrayId]: projects})
  }

  handleDoneEditingProject(arrayId, id, values){
    let projects = this.props.data[arrayId].slice()
    let breaks = this.props.data.breaks
    let settings = this.props.data.settings

    let index = projects.findIndex(project => project.id === parseInt(id))

    // undefined handling
    if(index < 0) return

    // break the reference (keep the reference for plannedTime if it hasn't changed)
    let changedProject = {}
    Object.keys(projects[index]).forEach(key => {
      changedProject[key] = projects[index][key]
    })

    // if we're changing something about the timing, break the reference to plannedTime too
    if(
      arrayId !== "defaultProjects" && (
        changedProject.estimatedDuration !== values.duration ||
        !TimeCalc.areIdentical(changedProject.plannedTime.start, values.startTime)
      )
    ){
      changedProject.plannedTime = Object.assign({}, changedProject.plannedTime)
    }

    projects.splice(index, 1) // breaking the reference pt. 2

    // if the user increased the startTime, save a new break
    if(
      settings.detectBreaksAutomatically &&
      index !== 0 &&
      arrayId !== "defaultProjects" &&
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
      arrayId !== "defaultProjects" &&
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
    let durationChanged, startTimeChanged
    if(arrayId !== "defaultProjects"){
      durationChanged = parseInt(changedProject.estimatedDuration) !== parseInt(values.duration)
      startTimeChanged = !TimeCalc.areIdentical(changedProject.plannedTime.start, values.startTime)
    }

    // change the values
    changedProject.name = values.name
    changedProject.estimatedDuration = values.duration
    if(arrayId !== "defaultProjects") changedProject.plannedTime.start = values.startTime

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
      changes = {[arrayId]: id}
      if(arrayId !== "defaultProjects"){
        projects[index].plannedTime.end = TimeCalc.add(projects[index].plannedTime.start, projects[index].estimatedDuration)
      }
    }

    // create the newState object
    let newState = {[arrayId]: projects}

    // if the startTime of the first project was changed, adjust this.props.data.startTime accordingly
    if(
      index === 0 &&
      arrayId !== "defaultProjects" &&
      !TimeCalc.areIdentical(this.props.data.startTime, changedProject.plannedTime.start)
    ){
      newState.startTime = changedProject.plannedTime.start
    }

    // save to state
    this.props.update(newState, changes)
  }

  handleProjectStateChange(id, val, progress){
    let projects = this.props.data.projects.slice()

    let index = projects.findIndex(project => project.id === parseInt(id))

    // break the reference
    let changedProject = Object.assign({}, projects[index])
    projects.splice(index, 1)

    // set the state of the changed project
    changedProject.state = val

    // if it's being paused, set progress
    if(val === "paused" && !isNaN(parseInt(progress))) changedProject.progress = progress

    // if it's being changed to workingOnIt, save current time
    if(val === "workingOnIt") changedProject.startedWorkingOnIt = this.props.currentTime

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

  handleCurrentTimeChange = time => {
    this.props.onCurrentTimeChange(time)
    setTimeout(this.setShowResetButton)
  }

  resetState = () => {
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

  closeDrawer = (drawerName, dataLabel) => {
    if(typeof this.state.temp["canClose" + drawerName] === "undefined" ||
      this.state.temp["canClose" + drawerName] ||
      window.confirm(`Some of the ${dataLabel} weren't editted properly. If you close this now, those changes will be lost`)
    ){
      let newTemp = this.state.temp
      newTemp["open" + drawerName] = false
      newTemp["canClose" + drawerName] = undefined
      if(drawerName === "DefaultProjectsDrawer") newTemp.defaultProjectsDrawerRemoveTransform = false
      this.setState(newTemp)
    }
  }

  saveBreaks = (breaks, canClose, changes) => {
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
    this.showSignInAgainTimeout = setTimeout(() => {
      this.setState({temp: {...this.state.temp, signInDissmissed: null}})
    }, 30*60*1000)
  }

  handleSignInDontRemindMeAgain = () => {
    this.setState({temp: {...this.state.temp, signInDissmissed: null}})
    localStorage.removeItem("userHasDismissedSignInBefore")
    localStorage.dontShowSignInPanelAgain = true
  }

  openDefaultProjectsDrawer = () => {
    this.setState({temp: {...this.state.temp, openDefaultProjectsDrawer: true}})
    setTimeout(() => {
      this.setState({temp: {...this.state.temp, defaultProjectsDrawerRemoveTransform: true}})
    }, 400)
  }

  changeView(view, change, additionalProps){
    // if the change is positive (we're moving into 'view')
    if(change){
      let newPath = "/" + view
      if(additionalProps && typeof additionalProps.stopPropagation !== "function"){
        newPath += "?"

        let isFirst = true
        for(let [key, value] of Object.entries(additionalProps)){

          // add "&" (unless it would be before the first param)
          if(isFirst) isFirst = false
          else newPath += "&"

          newPath += key + "=" + value
        }
      }
      this.props.history.push(newPath)
    }
    // if the change is negative (we're returning from 'view')
    else{
      let pathArr = this.props.history.location.pathname.split("/")
      pathArr.splice(-1, 1)
      this.props.history.push(pathArr.join("/"))
    }
  }

  addBreak = newBreak => {
    let { breaks } = this.props.data

    let newId = makeNewId(breaks, "breaks")

    breaks.push({
      id: newId,
      ...newBreak
    })

    this.props.update({breaks}, {breaks: newId})
  }

  handleDoneEditingBreak(id, inputValues){
    let breaks = this.props.data.breaks.slice()

    let index = breaks.findIndex(obj => obj.id === parseInt(id))

    if(index < 0) return

    let obj = JSON.parse(JSON.stringify(breaks[index]))

    obj.name = inputValues.name
    obj.startTime = inputValues.startTime
    obj.endTime = inputValues.endTime

    breaks.splice(index, 1, obj)

    this.props.update({breaks}, {breaks: id})
  }

  deleteBreak(id){
    let breaks = this.props.data.breaks

    let index = breaks.findIndex(obj => obj.id === parseInt(id))

    breaks.splice(index, 1)

    this.props.update({breaks}, {breaks: id})
  }

  render() {
    if(this.props.history.location.pathname === "/add"){
      let getParams = getGetParams(this.props.location.search)

      let title, arrayId, closeFunc, defaultColorIndex
      switch(getParams.type){
        case "default":
          arrayId = "defaultProjects"
          title = "Add a repetitive project"
          closeFunc = this.changeView.bind(this, "defaultProjects", true)
          defaultColorIndex = this.props.data.defaultColorIndexDefaultProjects
          break
        case "break":
          arrayId = "breaks"
          title = "Add a break"
          closeFunc = this.changeView.bind(this, "breaks", true)
          break
        default:
          arrayId = "projects"
          closeFunc = this.changeView.bind(this, "add", false)
          defaultColorIndex = this.props.data.defaultColorIndex
      }

      return (
        <AddProjectView
          settings={this.props.data.settings}
          defaultColorIndex={defaultColorIndex}
          showErrors={this.state.showErrors}
          currentTime={this.props.currentTime}
          lastProject={this.props.data.projects[this.props.data.projects.length - 1]}
          onAddProject={this.addProject.bind(this, arrayId)}
          onAddBreak={this.addBreak}
          type={getParams.type}
          close={closeFunc}
          title={title}
        />
      )
    }

    if(
      this.props.history.location.pathname === "/edit" &&
      this.props.data.breaks // only open after the data is loaded to prevent errors
    ){
      // parse GET params
      let getParams = getGetParams(this.props.location.search)

      let { type } = getParams

      let arrayId, close
      switch(type){
        case "default":
          arrayId = "defaultProjects"
          close = this.changeView.bind(this, "defaultProjects", true)
          break
        case "break":
          arrayId = "breaks"
          close = this.changeView.bind(this, "breaks", true)
          break
        default:
          arrayId = "projects"
          close = this.changeView.bind(this, "edit", false)
      }

      let id = getParams.id

      let array = this.props.data[arrayId]

      let index = array.findIndex(obj => obj.id.toString() === id)

      let obj = array[index]
      if(obj){ // handle undefined
        let inputValues = {name: obj.name}
        if(type !== "default") inputValues.startTime = obj.plannedTime ? obj.plannedTime.start : obj.startTime
        if(type === "break"){
          inputValues.endTime = obj.endTime
        }
        else{
          inputValues.duration = obj.estimatedDuration
          inputValues.color = obj.color
        }

        let deleteFunc, doneEditingFunc
        if(type === "break"){
          deleteFunc = this.deleteBreak.bind(this, id)
          doneEditingFunc = this.handleDoneEditingBreak.bind(this, id)
        }
        else{
          deleteFunc = this.deleteProject.bind(this, arrayId, id)
          doneEditingFunc = this.handleDoneEditingProject.bind(this, arrayId, id)
        }

        return (
          <EditProjectView
            settings={this.props.data.settings}
            inputValues={inputValues}
            delete={deleteFunc}
            onDoneEditing={doneEditingFunc}
            close={close}
            type={type}
          />
        )
      }
    }

    if(
      this.props.history.location.pathname === "/breaks"&&
      this.props.data.breaks
    ){
      return (
        <BreaksView
          breaks={this.props.data.breaks}
          changeView={this.changeView.bind(this)}
        />
      )
    }

    if(
      this.props.history.location.pathname === "/defaultProjects" &&
      this.props.data.defaultProjects
    ){
      return (
        <DefaultProjectsView
          projects={this.props.data.defaultProjects}
          settings={this.props.data.settings}
          defaultColorIndex={this.props.data.defaultColorIndexDefaultProjects}
          useDefaultProjects={this.props.data.useDefaultProjects}
          onColorChange={this.handleColorChange.bind(this, "defaultProjects")}
          onDoneEditing={this.handleDoneEditingProject.bind(this, "defaultProjects")}
          onAddProject={this.addProject.bind(this, "defaultProjects")}
          onDeleteProject={this.deleteProject.bind(this, "defaultProjects")}
          onDragEnd={this.handleDragEnd.bind(this, "defaultProjects")}
          onUseDefaultProjectsChange={e => {this.props.update({useDefaultProjects: e.target.checked})}}
          startEditingMobile={id => {
            this.changeView("edit", true, {type: "default", id})
          }}
          changeView={this.changeView.bind(this)}
        />
      )
    }

    let {allProjectsDone, totalTimeWorkedString} = this.state
    let productivityPercentage = this.props.data.productivityPercentage

    // merge showErrors from App and Router
    let showErrors = {
      ...this.props.showErrors,
      ...this.state.showErrors
    }

    return (
      <IsMobileContext.Consumer>
        {isMobile => (
          <Grid
            className="container"
            onKeyDown={this.handleRootKeyDown}
            tabIndex="0"
          >
            {!isMobile && (
              <ModeSwitch
                mode={this.props.data.mode}
                onModeChange={this.props.changeMode}>
                <TimeStats
                  currentTime={this.props.currentTime}
                  onCurrentTimeChange={this.handleCurrentTimeChange}
                  endTime={this.props.data.endTime}
                  projects={this.props.data.projects}
                  breaks={this.props.data.breaks}
                  settings={this.props.data.settings}
                  startTime={this.props.data.startTime}
                />
              </ModeSwitch>
            )}
            <Grid container>
              <SettingsContext.Provider value={this.props.data.settings}>
                <ProjectsTable
                  mode={this.props.data.mode}
                  projects={this.props.data.projects}
                  settings={this.props.data.settings}
                  currentTime={this.props.currentTime}
                  defaultColorIndex={this.props.data.defaultColorIndex}
                  showErrors={showErrors}
                  onColorChange={this.handleColorChange.bind(this, "projects")}
                  onDoneEditing={this.handleDoneEditingProject.bind(this, "projects")}
                  onAddProject={this.addProject.bind(this, "projects")}
                  onProjectStateChange={this.handleProjectStateChange.bind(this)}
                  onDeleteProject={this.deleteProject.bind(this, "projects")}
                  onDragEnd={this.handleDragEnd.bind(this, "projects")}
                  startEditingMobile={id => {
                    this.changeView("edit", true, {id})
                  }}
                />
                {
                  this.props.data.mode === "planning" ?
                  // planning mode
                  (
                    <React.Fragment>
                      <div id="setEndTime">
                        <label htmlFor="endTimeHoursInput">
                          {isMobile ? "End time" : "Time when you want to stop working"}:
                        </label>
                        <TimeSetter
                          onChange={this.handleEndTimeChange}
                          value={this.props.data.endTime}
                          firstInputId="endTimeHoursInput"
                          showError={showErrors.endTime}
                        />
                      </div>
                      <Grid container justify="space-around">
                        {
                          !isMobile && (
                            <Grid>
                              <Button
                                className="planningSecondaryButton"
                                onClick={() => {
                                  this.setState({temp: {...this.state.temp, openBreaksDrawer: true}})
                                }}
                                style={{marginBottom: "1rem"}}>
                                <PauseIcon color="primary" />
                                Edit breaks
                              </Button>
                            </Grid>
                          )
                        }
                        <Grid>
                          <Button
                            onClick={() => {this.props.changeMode("working")}}
                            variant="contained"
                            color="primary">
                            <StartIcon />
                            Let's get to work!
                          </Button>
                        </Grid>
                        {
                          !isMobile && (
                            <Grid>
                              <Button
                                className="planningSecondaryButton"
                                onClick={this.openDefaultProjectsDrawer}
                                style={{marginBottom: "1rem"}}>
                                <AutorenewIcon color="primary" />
                                Repetitive projects
                              </Button>
                            </Grid>
                          )
                        }
                      </Grid>
                      <Drawer
                        id="BreaksDrawer"
                        anchor="bottom"
                        open={this.state.temp.openBreaksDrawer && !isMobile}
                        onClose={() => {this.closeDrawer("BreaksDrawer", "breaks")}}
                      >
                        <BreaksDrawer
                          breaks={this.props.data.breaks}
                          currentTime={this.props.currentTime}
                          onSave={this.saveBreaks}
                          onClose={() => {this.closeDrawer("BreaksDrawer", "breaks")}}
                        />
                      </Drawer>
                      <Drawer
                        className={
                          this.state.temp.defaultProjectsDrawerRemoveTransform ?
                          "defaultProjectsDrawerRemoveTransform" : null
                        }
                        anchor="bottom"
                        open={this.state.temp.openDefaultProjectsDrawer && !isMobile}
                        onClose={() => {this.closeDrawer("DefaultProjectsDrawer", "projects")}}
                      >
                        <DefaultProjectsDrawer
                          projects={this.props.data.defaultProjects}
                          settings={this.props.data.settings}
                          defaultColorIndex={this.props.data.defaultColorIndexDefaultProjects}
                          useDefaultProjects={this.props.data.useDefaultProjects}
                          onClose={() => {this.closeDrawer("DefaultProjectsDrawer", "projects")}}
                          onColorChange={this.handleColorChange.bind(this, "defaultProjects")}
                          onDoneEditing={this.handleDoneEditingProject.bind(this, "defaultProjects")}
                          onAddProject={this.addProject.bind(this, "defaultProjects")}
                          onDeleteProject={this.deleteProject.bind(this, "defaultProjects")}
                          onDragEnd={this.handleDragEnd.bind(this, "defaultProjects")}
                          onUseDefaultProjectsChange={e => {this.props.update({useDefaultProjects: e.target.checked})}}
                          startEditingMobile={id => {
                            this.changeView("edit", true, {id})
                          }}
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
                      id="resetButton"
                      onClick={this.resetState}
                      variant="contained">
                      Reset
                    </Button>
                  </Grid>
                )}
              </SettingsContext.Provider>
            </Grid>
            {!isMobile && (
              <React.Fragment>
                <Link id="linkToSettings" to="/settings" aria-label="Settings" title="Settings">
                  <SettingsIcon />
                </Link>
                <DropdownMenu
                  connect={this.props.connect}
                  disconnect={this.props.disconnect}
                  history={this.props.history}
                  loggedIn={this.props.loggedIn}
                />
              </React.Fragment>
            )}
            <Slide
              direction="right"
              in={
                !this.props.loggedIn &&
                !this.state.temp.dontShowSignInYet &&
                !this.state.temp.signInDissmissed &&
                !localStorage.dontShowSignInPanelAgain &&
                !this.props.disconnected
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
            {isMobile && this.props.data.mode === "planning" && (
              <AddFab
                onClick={this.changeView.bind(this, "add", true)}
              />
            )}
          </Grid>
        )}
      </IsMobileContext.Consumer>
    );
  }
}
