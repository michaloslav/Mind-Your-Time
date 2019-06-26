import {defaultSettings} from '../defaultValues'

// define types
const numberOptional = {type: "number"}
const number = {type: "number", required: true}
const string = {type: "string", required: true}
const booleanOptional = {type: "boolean"}
const boolean = {type: "boolean", required: true}
const timeObjectOptional = {type: "object", properties: {h: number, m: number, pm: boolean, s: numberOptional}}
const timeObject = {...timeObjectOptional, required: true}
const date = {type: "string", isDate: true}
const array = elements => ({type: "object", isArray: true, elements})
const object = properties => ({type: "object", properties})

const projectBaseline = { // what projects and defaultProjects
  id: number,
  name: string,
  color: string,
  estimatedDuration: number,
  state: string,
  order: numberOptional,
  plannedTime: {type: "object", properties: {
    start: timeObject,
    end: timeObject
  }}
}

// create the settings structure based on defaultSettings
var settingsStructure = {}
for(let [key, val] of Object.entries(defaultSettings)){
  let typeofVal = typeof val

  if(typeofVal === "object"){
    if(Array.isArray(val)){
      settingsStructure[key] = array({type: typeof val[0], required: true})
    }
    else console.warn("Unhandled scenraio, settings contains an object that isn't an array")
  }
  else{
    settingsStructure[key] = {type: typeofVal, required: true}
  }
}

// create the lastModifiedStructure
var lastModifiedStructure = {}
const primitivesInLastModified = ["startTime", "endTime", "mode", "defaultColorIndex",
  "defaultColorIndexDefaultProjects", "lastReset", "useDefaultProjects"]
const projectBaselineKeys = Object.keys(projectBaseline)
const objectsInLastModified = {
  projects: [...projectBaselineKeys, "startedWorkingOnIt", "progress"],
  breaks: ["id", "name", "startTime", "endTime", "autodetected"],
  defaultProjects: [...projectBaselineKeys, "days"],
  settings: Object.keys(defaultSettings)
}
for(let primitive of primitivesInLastModified){
  lastModifiedStructure[primitive] = date
}
for(let [key, val] of Object.entries(objectsInLastModified)){
  let properties = {}

  for(let property of val){
    // id is required
    if(property === "id") properties.id = {...date, required: true}
    // other fields are optional
    else properties[property] = date
  }

  if(key === "settings") lastModifiedStructure[key] = object(properties)
  else{
    lastModifiedStructure[key] = object({
      __any__: object(properties)
    })
  }
}


const correctDataStructure = {
  projects: array(object({
    ...projectBaseline,
    startedWorkingOnIt: timeObjectOptional,
    progress: numberOptional
  })),
  breaks: array(object({
    id: number,
    name: string,
    startTime: timeObject,
    endTime: timeObject,
    autodetected: booleanOptional
  })),
  defaultProjects: array(object({
    ...projectBaseline,
    days: array(boolean)
  })),
  settings: object(settingsStructure),
  startTime: timeObject,
  endTime: timeObject,
  mode: string,
  defaultColorIndex: number,
  defaultColorIndexDefaultProjects: number,
  lastReset: string,
  useDefaultProjects: boolean,
  productivityPercentages: object({__any__: numberOptional}),
  realEndTime: date,
  lastModified: object(lastModifiedStructure)
}

export default correctDataStructure
