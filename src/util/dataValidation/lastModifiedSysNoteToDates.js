function lastModifiedSysNoteToDates(sysNote){
  var lastModified = {}
  Object.entries(sysNote).forEach(([key, val]) => {
    if(typeof val === "object") lastModified[key] = lastModifiedSysNoteToDates(val)
    else lastModified[key] = new Date()
  })
  return lastModified
}

export default lastModifiedSysNoteToDates
