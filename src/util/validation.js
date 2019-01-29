export function projectValidation(project){
  let error = []
  if(project.name === "") error.push("name")
  if(project.duration === "" || isNaN(project.duration) || project.duration > 1440) error.push("duration")
  if(project.startTime.h === "" || isNaN(project.startTime.h)) error.push("startTimeH")
  if(project.startTime.m === "" || isNaN(project.startTime.m)) error.push("startTimeM")

  if(error.length) return {valid: false, errors: error}
  else return {valid: true}
}

export function inputValidation(id, val){
  if(id === "duration" && isNaN(val) && val !== "") return false
  else return true
}
