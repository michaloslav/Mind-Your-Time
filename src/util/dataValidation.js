import {mergeObjects} from './objectUtil'
import {correctDataStructure} from './correctDataStructure'
import {defaultSettings} from './defaultValues'

// since we are using recursive functions, the lastModified property usually isn't available
// these sysNotes let the algorithm create notes for itself as to which fields were updated and therefore need a new lastModified field
// since sysNotes can be nested, the function needs to work recursively
function lastModifiedSysNoteToDates(sysNote){
  var lastModified = {}
  Object.entries(sysNote).forEach(([key, val]) => {
    if(typeof val === "object") lastModified[key] = lastModifiedSysNoteToDates(val)
    else lastModified[key] = new Date()
  })
  return lastModified
}

// in each function call, we only need a certain setion of the correctDataStructure
// this function finds and returns that section
function getCorrectDataStructureSection(keys){
  if(typeof keys === "string") console.warn("Keys must be an array!")

  // this error message is used if the section cannot be found
  var warningMessage = `Incorrect property detected in data: ${keys.join(".")} should not be defined`

  try{
    var result = keys.reduce((section, key) => section[key], correctDataStructure)
  }
  catch(e){
    console.warn(warningMessage)
    console.warn(e)
  }
  if(!result) console.warn(warningMessage)

  return result
}

// esentially just checks if the given primitive is the type it's supposed to be
function validatePrimitive(keys, val){
  var correctDataStructureSection = getCorrectDataStructureSection(keys)
  if(!correctDataStructureSection) return

  let expectedType = correctDataStructureSection.type
  let actualType = typeof val

  if(correctDataStructureSection.isDate){
    if(
      (actualType === "string" && !isNaN(new Date(val).getTime())) ||
      (actualType === "object" && !isNaN(val.getTime()))
    ) return val
    else{
      if(actualType === "undefined") return
      console.warn(`Incorrect type or invalid date detected: ${keys.join(".")} is '${val}' (of type ${actualType}) which isn't a valid date`)
      return
    }
  }

  if(expectedType === actualType ||
    (// allow numbers to be in the form of a string
      expectedType === "number" &&
      actualType === "string" &&
      !isNaN(parseFloat(val))
    ) ||
    ( // dates can be objects too
      expectedType === "string" &&
      correctDataStructureSection.isDate &&
      actualType === "object" &&
      val instanceof Date
    )
  ) return val
  else{
    if(actualType === "undefined") return // if the value is undefined and we're returning undefined, there's no need for a warning
    console.warn(`Incorrect type detected in data: ${keys.join(".")} is '${val}' which is of type ${actualType}, should be of type ${expectedType}`)
  }
}

// is used recursively for nested objects, eventually calls validatePrimitive to handle the actual type checking
function validateObject(keys, val){
  var correctedVal

  var correctDataStructureSection = getCorrectDataStructureSection(keys)
  if(!correctDataStructureSection) return

  if(correctDataStructureSection.isArray){
    correctedVal = []

    // if it's supposed to be an array and isn't, something went wrong
    if(!Array.isArray(val)) return

    for(let el of val){
      if(typeof el === "object"){
        correctedVal.push(validateObject([...keys, "elements"], el))
      }
      else{
        correctedVal.push(validatePrimitive([...keys, "elements"], el))
      }
    }
  }
  else{
    correctedVal = {}

    for(let [objKey, objVal] of Object.entries(val)){

      // get the expectedType (first try the key, then __any__, if both fails, throw an error)
      // (__any__ is used for objects that can have any property names)
      let expectedType, keyToPass
      if(correctDataStructureSection.properties[objKey]){
        expectedType = correctDataStructureSection.properties[objKey].type
        keyToPass = objKey // gets passed down to the next validateObject call to let it get the correctDataStructureSection
      }
      else{
        if(correctDataStructureSection.properties.__any__){
          expectedType = correctDataStructureSection.properties.__any__.type
          keyToPass = "__any__"
        }
        else{
          console.warn(`Incorrect property in data: ${keys.join(".")}.${objKey} should not be defined `)
          continue
        }
      }

      // if we're dealing with an object, call the function again recursively
      // else validate the types via validatePrimitive
      if(expectedType === "object"){
        correctedVal[objKey] = validateObject([...keys, "properties", keyToPass], objVal)

        // after the object is validated, check if it has a sysNote (explained above)
        // if so, pass it up
        // (in other word take it from the validated object and put it into the object that will eventually be returned
        // to make sure all the sysNotes are in 1 place)
        if(correctedVal[objKey] && correctedVal[objKey].__lastModifiedSysNote){
          if(!correctedVal.__lastModifiedSysNote) correctedVal.__lastModifiedSysNote = {}
          correctedVal.__lastModifiedSysNote[objKey] = correctedVal[objKey].__lastModifiedSysNote
          delete correctedVal[objKey].__lastModifiedSysNote
        }
      }
      else{
        correctedVal[objKey] = validatePrimitive([...keys, "properties", keyToPass], objVal)
      }
    }

    // check for missing required values
    for(let [propertyKey, propertyVal] of Object.entries(correctDataStructureSection.properties)){
      if(propertyVal.required && typeof val[propertyKey] === "undefined"){
        console.warn(`Property missing in data: ${keys.join(".")}.${propertyKey} is not defined`)

        // figure out what property to use
        // (currently only used if the missing property is in the settings, then the default value gets used)
        let propertyValToSet
        if(keys.length === 1 && keys[0] === "settings") propertyValToSet = defaultSettings[propertyKey]

        if(typeof propertyValToSet !== "undefined"){
          console.log(`${keys.join(".")}.${propertyKey} automatically set to ${propertyValToSet}`)
          correctedVal[propertyKey] = propertyValToSet

          if(!correctedVal.__lastModifiedSysNote) correctedVal.__lastModifiedSysNote = {}
          correctedVal.__lastModifiedSysNote[propertyKey] = true
        }
      }
    }
  }

  return correctedVal
}

// the validator itself only calls the other functions, all functionality is handled in a function-oriented fashion
export default function dataValidation(data){
  var correctedData = {}

  for(let [key, val] of Object.entries(data)){
    if(!correctDataStructure[key]){
      console.warn(`Incorrect key in data: ${key}`)
      continue
    }
    if(correctDataStructure[key].type === "object"){
      correctedData[key] = validateObject([key], val)

      // the sysNotes (see lastModifiedSysNoteToDates) are passed up the same way as in validateObject (see above)
      if(correctedData[key].__lastModifiedSysNote){
        if(!correctedData.__lastModifiedSysNote) correctedData.__lastModifiedSysNote = {}
        correctedData.__lastModifiedSysNote[key] = correctedData[key].__lastModifiedSysNote
        delete correctedData[key].__lastModifiedSysNote
      }
    }
    else correctedData[key] = validatePrimitive([key], val)
  }

  // finally convert the sysNotes (see lastModifiedSysNoteToDates) are converted into dates in lastModified
  if(correctedData.__lastModifiedSysNote){
    let newLastModifiedItems = lastModifiedSysNoteToDates(correctedData.__lastModifiedSysNote)
    delete correctedData.__lastModifiedSysNote

    if(!correctedData.lastModified) correctedData.lastModified = newLastModifiedItems
    else correctedData.lastModified = mergeObjects(correctedData.lastModified, newLastModifiedItems)
  }

  return correctedData
}
