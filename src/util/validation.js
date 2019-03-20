import TimeCalc from './TimeCalc'

export function projectValidation(project, dontValidateStartTime = false){
  let error = []
  if(project.name === "") error.push("name")
  if(project.duration === "" || isNaN(project.duration) || project.duration > 1440) error.push("duration")
  if(!dontValidateStartTime){
    if(project.startTime.h === "" || isNaN(project.startTime.h)) error.push("startTimeH")
    if(project.startTime.m === "" || isNaN(project.startTime.m)) error.push("startTimeM")
  }

  if(error.length) return {valid: false, errors: error}
  else return {valid: true}
}

export function inputValidation(id, val){
  if(id === "name" && val.length > 30) return false
  if(id === "duration" && isNaN(val) && val !== "") return false
  else return true
}

export function breakValidation(breakInfo){
  let error = []
  if(breakInfo.name === "") error.push("name")
  if(breakInfo.startTime.h === "" || isNaN(breakInfo.startTime.h)) error.push("startTimeH")
  if(breakInfo.startTime.m === "" || isNaN(breakInfo.startTime.m)) error.push("startTimeM")
  if(breakInfo.endTime.h === "" || isNaN(breakInfo.endTime.h)) error.push("endTimeH")
  if(breakInfo.endTime.m === "" || isNaN(breakInfo.endTime.m)) error.push("endTimeM")
  if(TimeCalc.isBiggerThan(breakInfo.startTime, breakInfo.endTime, false, true)) error.push("endTime")

  if(error.length) return {valid: false, errors: error}
  else return {valid: true}
}
