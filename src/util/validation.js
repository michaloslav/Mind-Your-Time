import TimeCalc from './TimeCalc'
import validationRegex from './validationRegex'

// validates the entire project/defaultProject object
export function projectValidation(project, dontValidateStartTime = false){
  let error = []
  if(project.name === "") error.push("name")
  if(
    project.duration === "" ||
    isNaN(project.duration) ||
    project.duration > 1440 ||
    project.duration <= 0
  ) error.push("duration")
  if(!dontValidateStartTime){ // in other words if the object is a project, not a defaultProject
    if(project.startTime.h === "" || isNaN(project.startTime.h)) error.push("startTimeH")
    if(project.startTime.m === "" || isNaN(project.startTime.m)) error.push("startTimeM")
  }

  if(error.length) return {valid: false, errors: error} // if there were errors, validation failed
  else return {valid: true}
}

// validates a single input
export function inputValidation(id, val){
  if(id === "name" && val.length > 30) return false
  if(id === "duration" && ((isNaN(val) && val !== "") || val < 0)) return false
  if(validationRegex.test(val)) return false // blocks characters that could cause trouble in the stringified JSON

  return true
}

// validates a break
export function breakValidation(breakInfo){
  // check all that all the requirements are met
  let error = []
  if(breakInfo.name === "") error.push("name")
  if(breakInfo.startTime.h === "" || isNaN(breakInfo.startTime.h) || breakInfo.startTime.h < 0) error.push("startTimeH")
  if(breakInfo.startTime.m === "" || isNaN(breakInfo.startTime.m) || breakInfo.startTime.m < 0) error.push("startTimeM")
  if(breakInfo.endTime.h === "" || isNaN(breakInfo.endTime.h) || breakInfo.endTime.h < 0) error.push("endTimeH")
  if(breakInfo.endTime.m === "" || isNaN(breakInfo.endTime.m) || breakInfo.endTime.m < 0) error.push("endTimeM")
  if(TimeCalc.isBiggerThan(breakInfo.startTime, breakInfo.endTime, false, true)) error.push("endTime")

  // if there were errors, validation failed, otherwise it succeeded
  if(error.length) return {valid: false, errors: error}
  else return {valid: true}
}
