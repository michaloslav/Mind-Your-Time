import React, { Component } from 'react';
import Router from './Router'
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import * as SocketIOClient from 'socket.io-client'
import Cookies from 'universal-cookie';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';
import { defaultSettings } from './_defaultSettings'

const cookies = new Cookies()

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

export default class DataSync extends Component{
  constructor(props){
    super(props)
    this.state = {
      projects: [],
      settings: {},
      lastModified: {},
      temp: {}
    }

    this.io = SocketIOClient.connect('https://mind-your-time-server.herokuapp.com')

    setTimeout(() => {
      // check if the user is offline
      if(this.io.disconnected){
        console.warn("Can't connect to server");

        let temp = this.state.temp
        temp.disconnected = true
        // only show the error if the user is logged in
        if(this.state.accessToken) temp.showDisconnectedError = true
        this.setState({temp})
      }
    }, 5)

    this.io.on("connect", data => {
      // if the user was previously disconnected and they're logged in, connect them
      if(!this.state.temp.successfulConnectInit && this.state.temp.disconnected && this.state.accessToken){
        this.io.emit("connectInit", {
          type: "accessToken", accessToken: this.state.accessToken, localData: this.getData()
        })
      }

      let temp = this.state.temp
      temp.disconnected = false
      temp.showDisconnectedError = false
      clearTimeout(temp.showDisconnectedErrorTimeout)

      this.setState({temp})
    })

    this.io.on("disconnect", data => {
      let temp = this.state.temp
      temp.disconnected = true
      // only show the error if the user is logged in
      if(this.state.accessToken) temp.showDisconnectedErrorTimeout = setTimeout(() => {
        this.setState({temp: {...this.state.temp, showDisconnectedError: true}})
      }, 1500)
      this.setState({temp})
    })

    this.io.on("success", data => {
      // login
      if(data.type === "connectInsert" || data.type === "connectUpdate"){
        cookies.set("accessToken", data.accessToken, {path: "/"})

        this.setState({
          accessToken: data.accessToken,
          temp: {...this.state.temp, successfulConnectInit: true}
        })
      }

      // logout
      if(data.type === "disconnect"){
        cookies.remove("accessToken")
        this.setState({accessToken: undefined})
      }
    })

    this.io.on("error", data => {
      console.warn("error", data);

      if(data.type === "invalidAccessToken"){
        cookies.remove("accessToken")
        this.setState({accessToken: undefined})
      }
    })

    this.io.on('connectUpdate', this.handleUpdateFromServer)

    this.io.on('update', this.handleUpdateFromServer)
  }

  componentDidMount(){
    let objectsToLoad = ["projects", "breaks", "settings", "startTime", "endTime"]
    let propertiesToLoad = ["mode", "defaultColorIndex", "productivityPercentage"]

    let defaultValues = {
      projects: [],
      breaks: [],
      settings: defaultSettings,
      startTime: {h: 2, m: "00", pm: true},
      endTime: {h: 9, m: "00", pm: true},
      mode: "planning",
      defaultColorIndex: 0,
      productivityPercentage: undefined
    }


    let data = {}

    objectsToLoad.forEach(el => {
      try{
        data[el] = JSON.parse(localStorage[el])
      }
      catch(e){
        // set default (if data from localStorage can't be used)
        data[el] = defaultValues[el]
      }
    })

    propertiesToLoad.forEach(el => {
      data[el] = localStorage[el] ? localStorage[el] : defaultValues[el]
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

    console.log(data);

    this.setState(data)

    // if the user's logged in, connect to the server
    setTimeout(() => {
      let accessToken = cookies.get("accessToken")
      if(accessToken){
        if(this.io.disconnected) this.setState({accessToken})
        else this.io.emit("connectInit", {type: "accessToken", accessToken, localData: data})
      }
    }, 5)
  }

  connect(idToken){
    // if the user is offline or the server is down...
    if(this.io.disconnected){
      this.setState({temp: {...this.state.temp, showDisconnectedError: true}})
      return
    }

    let {projects, breaks, settings, startTime, endTime, mode, defaultColorIndex, lastReset, lastModified} = this.state

    let localData = {projects, breaks, settings, startTime, endTime, mode, defaultColorIndex, lastReset, lastModified}
    if(this.state.productivityPercentage) localData.productivityPercentage = this.state.productivityPercentage

    this.idToken = idToken

    this.io.emit("connectInit", {type: "OAuth", idToken, localData})
  }

  disconnect(){
    // if the user is offline or the server is down...
    if(this.io.disconnected){
      this.setState({temp: {...this.state.temp, showDisconnectedError: true}})
      return
    }

    this.io.emit("disconnectU", {accessToken: cookies.get("accessToken")})
  }

  update(data, changes){
    // handle reset
    if(data.projects && !data.projects.length && this.state.projects.length){
      console.log("reset");
      data.breaks = []
      data.lastReset = new Date()
      data.productivityPercentage = undefined

      // delete the project/break lastModified fields in localStorage and state
      this.setState({lastModified: {...this.state.lastModified, projects: {}, breaks: {}}})
      this.deleteObjectsLocalStorage("lastModified_projects_")
      this.deleteObjectsLocalStorage("lastModified_breaks_")
    }

    // assign order to projects
    if(data.projects){
      data.projects.forEach((project, i) => {
        project.order = i
      })
    }

    // last modified
    let lastModified = {}
    Object.keys(data).forEach(el => {
      switch (el) {
        case "projects":
          lastModified.projects = this.setMultipleLastModified(
            data.projects,
            changes ? changes.projects : undefined,
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
        case "settings":
          lastModified.settings = this.state.lastModified && this.state.lastModified.settings ? this.state.lastModified.settings : {}
          Object.keys(data.settings).forEach(el => {
            if(data.settings[el] !== this.state.settings[el]){
              lastModified.settings[el] = new Date()
              localStorage["lastModified_settings_" + el] = lastModified.settings[el]
            }
          })
          break;
        default:
          lastModified[el] = new Date()
          localStorage["lastModified_" + el] = lastModified[el]
      }
    })
    data.lastModified = {...this.state.lastModified, ...lastModified}

    this.setState(data)

    // save to localStorage
    for(let el of Object.keys(data)){
      if(el === "lastModified") continue // lastModified was already saved to localStorage above

      if(typeof data[el] === "object" && el !== "lastReset") localStorage[el] = JSON.stringify(data[el])
      else localStorage[el] = data[el]
    }

    // send an update to the server
    if(this.state.accessToken && !this.io.disconnected){
      this.io.emit("update", {accessToken: this.state.accessToken, data})
    }
  }

  closeSnackbar = () => {
    this.setState({
      temp: {...this.state.temp, showDisconnectedError: false}
    })
  }

  // get only relevant data from the state
  getData(){
    let data = {}
    Object.keys(this.state).forEach(el => {
      if(el !== "accessToken" && el !== "temp" && el !== "lastModified"){
        data[el] = this.state[el]
      }
    })
    return data
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
      localStorage[localStorageKey] = lastModified.id

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
          propertyChanged = !this.areIdenticalObjects(
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
        localStorage[localStorageKey] = lastModified[property]
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
        let index = array.findIndex(object => object.id === changedId)
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
        Object.keys(data.lastModified).forEach(lastModifiedKey => {
          if(lastModifiedKey === "projects" || lastModifiedKey === "breaks"){
            Object.keys(data.lastModified[lastModifiedKey]).forEach(objectIdKey => {
              Object.keys(data.lastModified[lastModifiedKey][objectIdKey]).forEach(propertyKey => {
                let localStorageKey = ["lastModified", lastModifiedKey, objectIdKey, propertyKey].join("_")
                localStorage[localStorageKey] = data.lastModified[lastModifiedKey][objectIdKey][propertyKey]
              })
            })
          }
          else localStorage["lastModified_" + lastModifiedKey] = data.lastModified[lastModifiedKey]
        })
      }
      else{
        if(typeof data[key] === "object") localStorage[key] = JSON.stringify(data[key])
        else localStorage[key] = data[key]
      }
    })
  }

  areIdenticalObjects = (obj1, obj2) => {
    if(!obj2) return false

    let keys
    if(Array.isArray(obj1)) keys = Array.keys(obj1)
    else keys = Object.keys(obj1)

    for(let key of keys){
      if(typeof obj1[key] === "object") if(!this.areIdenticalObjects(obj1[key], obj2[key])) return false
      else if(obj1[key] !== obj2[key]) return false
    }

    return true
  }

  render(){
    let data = this.getData()

    return (
      <MuiThemeProvider theme={theme}>
        <Router
          data={data}
          connect={this.connect.bind(this)}
          update={this.update.bind(this)}
          disconnect={this.disconnect.bind(this)}
          loggedIn={Boolean(this.state.accessToken)}
          disconnected={this.state.temp.disconnected}
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
      </MuiThemeProvider>
    )
  }
}