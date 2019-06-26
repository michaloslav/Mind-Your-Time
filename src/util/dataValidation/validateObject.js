import getCorrectDataStructureSection from './getCorrectDataStructureSection'
import validatePrimitive from './validatePrimitive'
import {defaultSettings} from '../defaultValues'

function validateObject(keys, val){
  var correctedVal

  var correctDataStructureSection = getCorrectDataStructureSection(keys)
  if(!correctDataStructureSection) return

  if(correctDataStructureSection.isArray){
    correctedVal = []

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

    if(typeof val !== "object" || val === null) return

    for(let [objKey, objVal] of Object.entries(val)){

      // get the expectedType (first try the key, then __any__, if both fails, throw an error)
      let expectedType, keyToPass
      if(correctDataStructureSection.properties[objKey]){
        expectedType = correctDataStructureSection.properties[objKey].type
        keyToPass = objKey
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

      if(expectedType === "object"){
        correctedVal[objKey] = validateObject([...keys, "properties", keyToPass], objVal)
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

    // check for missing values
    for(let [propertyKey, propertyVal] of Object.entries(correctDataStructureSection.properties)){
      if(propertyVal.required && typeof val[propertyKey] === "undefined"){
        console.warn(`Property missing in data: ${keys.join(".")}.${propertyKey} is not defined`)

        // figure out what property to use
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

export default validateObject
