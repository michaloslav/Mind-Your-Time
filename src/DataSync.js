import React, { Component } from 'react';
import Router from './Router'
import TimeCalc, { setTimesForProjects } from './util/TimeCalc'
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import IconButton from '@material-ui/core/IconButton';
import CssBaseline from '@material-ui/core/CssBaseline';
import CloseIcon from '@material-ui/icons/Close';
import * as SocketIOClient from 'socket.io-client'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';
import { defaultDataValues } from './util/defaultValues'
import makeNewId from './util/makeNewId'
import dataValidation from './util/dataValidation'
import {areIdenticalObjects, mergeObjects} from './util/objectUtil'
import './css/themes.css'

const lightTheme = createMuiTheme({
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

const darkTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#039be5',
    },
    secondary: green,
    type: "dark"
  },
  typography: {
    useNextVariants: true
  }
})

// takes care of all data operations (loading, saving, syncing) as well as signing in/out
export default class DataSync extends Component{
  constructor(props){
    super(props)
    this.state = {
      projects: [],
      settings: {},
      lastModified: {},
      temp: {}
    }

    /*this.io = SocketIOClient.connect('localhost:3000')
    console.warn("connecting to localhost");*/
    this.io = SocketIOClient.connect('https://mind-your-time-server.herokuapp.com')

    // check if the user is offline (first give the sockets enough time to try to connect)
    setTimeout(() => {
      if(this.io.disconnected){ // if connection failed
        console.warn("Can't connect to server");

        let temp = this.state.temp
        temp.disconnected = true
        // show an error if the user is logged in
        if(this.state.accessToken) temp.showDisconnectedError = true

        this.setState({temp})
      }
    }, 500)

    // the SocketIO init event
    this.io.on("connect", data => {
      // if the user was previously disconnected and they're logged in, connect them
      if(!this.state.temp.successfulConnectInit && this.state.temp.disconnected && this.state.accessToken){
        let localData

        // if the initil connection wasn't successful or if there have been updates while the user was disconnected...
        if(!this.state.temp.successfulConnectInit || this.state.temp.updatedWhileDisconnected){
          // gather all the relevant data
          let {accessToken, temp, ...data} = this.state
          localData = data
        }
        else localData = {}

        // send the initial connect event to the server
        this.io.emit("connectInit", {
          type: "accessToken", accessToken: this.state.accessToken, localData
        })
      }

      // hide the errors
      let temp = this.state.temp
      temp.disconnected = false
      temp.showDisconnectedError = false
      clearTimeout(temp.showDisconnectedErrorTimeout)

      this.setState({temp})
    })

    // if the user goes offline/server stops responding
    this.io.on("disconnect", data => {
      let temp = this.state.temp
      temp.disconnected = true
      // show an error if the user is logged in
      // (after a reasonable amount of time so that the client can try to reconnect)
      if(this.state.accessToken) temp.showDisconnectedErrorTimeout = setTimeout(() => {
        this.setState({temp: {...this.state.temp, showDisconnectedError: true}})
      }, 1500)
      this.setState({temp})
    })

    // this event simply lets the client side know that everything went ok on the server
    // in the case of the login events, it also sends along an accessToken which is used the next time when connecting to the server
    this.io.on("success", data => {
      // login
      if(data.type === "connectInsert" || data.type === "connectUpdate"){
        // store the accessToken (in the localStorage for lack of a better place)
        localStorage.accessToken = data.accessToken

        this.setState({
          accessToken: data.accessToken,
          temp: {...this.state.temp, successfulConnectInit: true}
        })
      }

      // logout
      if(data.type === "disconnect"){
        // remove the accessToken
        delete localStorage.accessToken
        this.setState({accessToken: undefined})
      }
    })

    // if there was an error, show a warning in the console
    this.io.on("errorU", data => {
      console.warn("error", data);

      // if the accessToken is invalid, we should remove it to sign out the user
      // (we don't want the client side thinking it's still logged in if it's credentials are invalid)
      if(data.type === "invalidAccessToken"){
        delete localStorage.accessToken
        this.setState({accessToken: undefined})
      }
    })

    // if the server sent new data, use the handleUpdateFromServer method to store the new data locally
    this.io.on('connectUpdate', this.handleUpdateFromServer)
    this.io.on('update', this.handleUpdateFromServer)
  }

  componentDidMount(){
    // load all the data from localStorage
    // these are all the keys that need to be loaded:
    let objectsToLoad = ["projects", "breaks", "defaultProjects", "settings", "startTime", "endTime", "productivityPercentages"]
    let propertiesToLoad = ["mode", "defaultColorIndex", "defaultColorIndexDefaultProjects", "useDefaultProjects", "lastReset", "realEndTime"]

    let data = {}

    // for objects, parse the JSON and catch any errors
    objectsToLoad.forEach(el => {
      try{
        data[el] = JSON.parse(localStorage[el])
      }
      catch(e){
        // set default (if data from localStorage can't be used)
        data[el] = defaultDataValues[el]
      }
    })

    // for primitives, simply load the data
    propertiesToLoad.forEach(el => {
      data[el] = localStorage[el] ? localStorage[el] : defaultDataValues[el]
    })

    // load lastModified
    for(let localStorageKey of Object.keys(localStorage)){
      if(localStorageKey.startsWith("lastModified_")){
        // set the value for an arbitrarily long path
        let pathArray = localStorageKey.split("_")
        let pathLength = pathArray.length
        let lastModifiedObj = data
        for(let i = 0; i < pathLength - 1; i++){
          if(!(pathArray[i] in lastModifiedObj)) lastModifiedObj[pathArray[i]] = {}
          lastModifiedObj = lastModifiedObj[pathArray[i]]
        }
        lastModifiedObj[pathArray[pathLength - 1]] = new Date(localStorage[localStorageKey])
      }
    }

    this.setState(data);

    // if the user's logged in, connect to the server using the gathered data
    (data => {
      setTimeout(() => {
        let {accessToken} = localStorage
        if(accessToken){
          if(this.io.disconnected) this.setState({accessToken})
          else this.io.emit("connectInit", {type: "accessToken", accessToken, localData: data})
        }
      }, 5)
    }).call(this, data)
  }

  // logging in
  connect = idToken => {
    // if the user is offline or the server is down...
    if(this.io.disconnected){
      this.setState({temp: {...this.state.temp, showDisconnectedError: true}})
      return
    }

    // gather localData
    var {accessToken, temp, ...localData} = this.state

    this.idToken = idToken

    // log in
    this.io.emit("connectInit", {type: "OAuth", idToken, localData})
  }

  // log out
  disconnect = (dontConfirm = false) => {
    if(dontConfirm || window.confirm("Are you sure you want to sign out?")){
      // if the user is offline or the server is down...
      if(this.io.disconnected){
        this.setState({temp: {...this.state.temp, showDisconnectedError: true}})
        return
      }

      this.io.emit("disconnectU", {accessToken: localStorage.accessToken})
    }
  }

  // if any data changes in the app, update the state and if logged in, send an update to the server
  update = (data, changes) => {
    // handle a reset
    if(data.projects && !data.projects.length && this.state.projects.length){
      if(data.useDefaultProjects || this.state.useDefaultProjects){
        // get the current dayOfTheWeek
        // (defaultProjects have the option of only being applied on certain days of the week)
        let dayOfTheWeek = new Date().getDay()
        // in getDay(), 0 means Sunday -> convert it so that 0 means Monday
        dayOfTheWeek--
        if(dayOfTheWeek < 0) dayOfTheWeek = 6

        // insert the defaultProjects into projects
        // (don't insert the days array, break the object reference at the same time)
        data.projects = []
        this.state.defaultProjects.forEach(defProj => {
          let {days, ...projectToInsert} = defProj
          if(!days || days[dayOfTheWeek]) data.projects.push(projectToInsert)
        })

        // suggest a new startTime and set the project times
        let settings = data.settings || this.state.settings
        let startTime = TimeCalc.add(new Date().getHours() * 60 + new Date().getMinutes(), 10)
        startTime = TimeCalc.round(startTime, settings.roundTo)
        data.projects = setTimesForProjects(data.projects, settings, [], startTime)

        // generate a new unique ID for each project
        data.projects.forEach(project => {
          project.id = makeNewId(data.projects, "projects")
        })

        // set the startTime
        data.startTime = startTime

        var setLastModifiedOfAllProjects = true
      }
      else data.projects = []

      // reset certain fields
      data.breaks = []
      data.lastReset = new Date().toISOString()
      data.realEndTime = undefined

      // reset lastModified
      if(!data.lastModified) data.lastModified = {}
      data.lastModified.projects = {}
      data.lastModified.breaks = {}

      // delete the project/break lastModified fields in localStorage
      this.deleteObjectsLocalStorage("lastModified_projects_")
      this.deleteObjectsLocalStorage("lastModified_breaks_")
    }

    // data validation (to prevent corrupted data from entering the system)
    data = dataValidation(data)

    // assign order to projects
    for(let arrId of ["projects", "defaultProjects"]){
      if(data[arrId]){
        data[arrId].forEach((project, i) => {
          project.order = i
        })
      }
    }

    // convert dates
    if(data.realEndTime) data.realEndTime = data.realEndTime.toISOString()

    // generate lastModified (used for deciding which data to use on the server side)
    let lastModified = {}
    Object.keys(data).forEach(el => {
      switch (el) {
        case "projects":
          lastModified.projects = this.setMultipleLastModified(
            data.projects,
            changes && !setLastModifiedOfAllProjects ? changes.projects : undefined,
            "projects"
          )
          break;
        case "breaks":
          lastModified.breaks = this.setMultipleLastModified(
            data.breaks,
            changes ? changes.breaks : undefined,
            "breaks"
          )
          break;
        case "defaultProjects":
          lastModified.defaultProjects = this.setMultipleLastModified(
            data.defaultProjects,
            changes ? changes.defaultProjects : undefined,
            "defaultProjects"
          )
          break;
        case "settings":
          lastModified.settings = this.state.lastModified && this.state.lastModified.settings ? this.state.lastModified.settings : {}
          Object.keys(data.settings).forEach(el => {
            if(data.settings[el] !== this.state.settings[el]){
              lastModified.settings[el] = new Date()
              localStorage["lastModified_settings_" + el] = lastModified.settings[el].toISOString()
            }
          })
          break;
        case "lastReset":
        case "realEndTime":
          break
        default:
          lastModified[el] = new Date()
          localStorage["lastModified_" + el] = lastModified[el].toISOString()
      }
    })

    // merge the new lastModified with the one in the state
    data.lastModified = mergeObjects(this.state.lastModified, lastModified)

    // set the state (merge with the current state)
    this.setState(data)

    // save to localStorage
    for(let [key, val] of Object.entries(data)){
      if(key === "lastModified") continue // lastModified was already saved to localStorage above

      if(typeof val === "undefined"){
        delete localStorage[key]
        continue
      }
      if(typeof val === "object" && key !== "lastReset") localStorage[key] = JSON.stringify(val)
      else localStorage[key] = val
    }

    // send an update to the server (if the user is logged in and online)
    if(this.state.accessToken){
      if(!this.io.disconnected){
        // always send the lastReset along
        if(!data.lastReset) data.lastReset = this.state.lastReset

        // only use the relevant part of lastModified
        let lastModifiedToSend = {}
        for(let key of Object.keys(lastModified)) lastModifiedToSend[key] = data.lastModified[key]
        data.lastModified = lastModifiedToSend

        this.io.emit("update", {accessToken: this.state.accessToken, data})
      }
      else{
        this.setState({temp: {...this.state.temp, updatedWhileDisconnected: true}})
      }
    }
  }

  closeSnackbar = () => {
    this.setState({
      temp: {...this.state.temp, showDisconnectedError: false}
    })
  }

  // determine which properties of a project or a break were modified, save lastModified to localStorage and return it too
  /*
    object = project or break
    key = "projects" or "breaks"
    lastModified is only the project's/break's last modified (from the state)
  */
  setLastModified = (object, objectId, key, lastModified) => {
    // if the user deleted the object
    if(!object){
      lastModified = {id: new Date()}
      let localStorageKey = ["lastModified", key, objectId, "id"].join("_")
      localStorage[localStorageKey] = lastModified.id.toISOString()

      this.deleteObjectsLocalStorage(["lastModified", key, objectId, ""].join("_"), localStorageKey)

      return lastModified
    }

    // handle undefined
    if(!lastModified) lastModified = {}

    // find the object in the state
    let stateObjectIndex = this.state[key].findIndex(el => el.id === objectId)

    // loop through the properties we want to keep track of
    Object.keys(object).forEach(property => {
      // if it was changed...
      let propertyChanged
      // (if the user created a new project/break, it won't be in the state yet)
      if(this.state[key][stateObjectIndex]){
        if(typeof object[property] === "object"){
          propertyChanged = !areIdenticalObjects(
            object[property],
            this.state[key][stateObjectIndex][property]
          )
        }
        else propertyChanged = object[property] !== this.state[key][stateObjectIndex][property]
      }
      else propertyChanged = true

      if(propertyChanged){
        lastModified[property] = new Date()

        let localStorageKey = ["lastModified", key, objectId, property].join("_")
        localStorage[localStorageKey] = lastModified[property].toISOString()
      }
    })

    return lastModified
  }

  // determine which projects/breaks were modified, call setLastModified on them
  /*
    array = array of projects or breaks from the update method's args
    lastModified is only lastModified.projects or .breaks
    changedIds can be undefined
    key = "projects" or "breaks"
  */
  setMultipleLastModified = (array, changedIds, key) => {
    let lastModified = this.state.lastModified[key] // init
    if(!lastModified) lastModified = {} // handle undefined

    // if only a specific project/break was modified, check its fields
    if(changedIds){
      // handle an input with just 1 id
      if(typeof changedIds !== "object") changedIds = [changedIds]

      changedIds.forEach(changedId => {
        let index = array.findIndex(object => object.id === parseInt(changedId))
        let changedObject = array[index]

        lastModified[changedId] = this.setLastModified(
          changedObject,
          changedId,
          key,
          lastModified[changedId]
        )
      })
    }
    // else check all projects
    else{
      array.forEach((object, i) => {
        let objectId = object.id

        lastModified[objectId] = this.setLastModified(
          object,
          objectId,
          key,
          lastModified[objectId]
        )
      })
    }

    return lastModified
  }

  // a util method for deleting localStorage entries tha fulfill certain criteria
  deleteObjectsLocalStorage = (startsWithString, except = "") => {
    let localStorageKeys = Object.keys(localStorage)
    let relevantKeys = []
    localStorageKeys.forEach(key => {
      if(key.startsWith(startsWithString) && key !== except) relevantKeys.push(key)
    })
    relevantKeys.forEach(key => {
      localStorage.removeItem(key)
    })
  }

  // if the server sends an update, insert it into the state and save it to localStorage
  handleUpdateFromServer = data => {
    // merge lastModified when saving to state
    this.setState({
      ...data,
      lastModified: {
        ...this.state.lastModified,
        ...data.lastModified
      }
    })

    // save to localStorage
    Object.keys(data).forEach(key => {
      if(key === "lastModified"){
        // since lastModified is a nested object, it needs to be stored more carefully
        // we want to be able to modify differnt fields quickly which is why...
        // it is stored as many different entries, eg. "lastModified_project_{id}_name"
        // this part of the code handles the nested nature of the object and also converts the dates into ISO strings
        Object.keys(data.lastModified).forEach(lastModifiedKey => {
          if(
            lastModifiedKey === "projects" ||
            lastModifiedKey === "breaks" ||
            lastModifiedKey ==="defaultProjects"
          ){
            for(let objectIdKey of Object.keys(data.lastModified[lastModifiedKey])){
              if(
                !data.lastModified[lastModifiedKey][objectIdKey] ||
                typeof data.lastModified[lastModifiedKey][objectIdKey] !== "object"
              ) continue
              Object.keys(data.lastModified[lastModifiedKey][objectIdKey]).forEach(propertyKey => {
                let localStorageKey = ["lastModified", lastModifiedKey, objectIdKey, propertyKey].join("_")
                let dateString = data.lastModified[lastModifiedKey][objectIdKey][propertyKey]
                if(typeof dateString !== "string") dateString = dateString.toISOString()
                localStorage[localStorageKey] = dateString
              })
            }
          }
          else{
            if(lastModifiedKey === "settings"){
              for(let settingsKey of Object.keys(data.lastModified.settings)){
                let dateString = data.lastModified.settings[settingsKey]
                if(!dateString) continue
                let localStorageKey = "lastModified_settings_" + settingsKey
                if(typeof dateString !== "string") dateString = dateString.toISOString()
                localStorage[localStorageKey] = dateString
              }
            }
            else{
              let dateString = data.lastModified[lastModifiedKey]
              if(dateString){
                if(typeof dateString !== "string") dateString = dateString.toISOString()
                localStorage["lastModified_" + lastModifiedKey] = dateString
              }
            }
          }
        })
      }
      else{
        // store the actual values
        if(typeof data[key] === "object") localStorage[key] = JSON.stringify(data[key])
        else localStorage[key] = data[key]
      }
    })
  }

  checkForUpdates = () => {
    if(this.state.accessToken && !this.io.disconnected){
      this.io.emit("checkForUpdates", {accessToken: this.state.accessToken})
    }
  }

  render(){
    var {accessToken, temp, lastModified, ...data} = this.state

    return (
      <MuiThemeProvider theme={data.settings.darkTheme ? darkTheme : lightTheme}>
        <div style={{position: "relative"}} onFocus={this.checkForUpdates}
          className={data.settings.darkTheme ? "darkRoot" : "lightRoot"}
        >
          <CssBaseline />
          <Router
            data={data}
            connect={this.connect}
            update={this.update}
            disconnect={this.disconnect}
            loggedIn={Boolean(this.state.accessToken)}
            disconnected={this.state.temp.disconnected}
            checkForUpdates={this.checkForUpdates}
          />
          <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            open={this.state.temp.showDisconnectedError}
            autoHideDuration={6000}
            onClose={this.closeSnackbar}
          >
            <SnackbarContent
              style={{backgroundColor: "#d32f2f"}}
              aria-describedby="disconnectedErrorSnackbar"
              message={<span id="disconnectedErrorSnackbar">We're having trouble reaching our server</span>}
              action={[
                <IconButton
                  key="close"
                  aria-label="Close"
                  color="inherit"
                  styles={{padding: ".5rem"}}
                  onClick={this.closeSnackbar}
                >
                  <CloseIcon />
                </IconButton>
              ]}
            />
          </Snackbar>
        </div>
      </MuiThemeProvider>
    )
  }
}
