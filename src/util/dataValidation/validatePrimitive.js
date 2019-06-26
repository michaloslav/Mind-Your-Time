import getCorrectDataStructureSection from './getCorrectDataStructureSection'

function validatePrimitive(keys, val){
  var correctDataStructureSection = getCorrectDataStructureSection(keys)
  if(!correctDataStructureSection) return

  let expectedType = correctDataStructureSection.type
  let actualType = typeof val

  if(expectedType === actualType ||
    (// allow numbers to be in the form of a string
      expectedType === "number" &&
      actualType === "string" &&
      !isNaN(parseFloat(val))
    ) ||
    (// allows bools in the form of a strings
      expectedType === "boolean" &&
      actualType === "string" &&
      (val === "true" || val === "false")
    )
  ) return val
  else console.warn(`Incorrect type detected in data: ${keys.join(".")} is '${val}' which is of type ${actualType}, should be of type ${expectedType}`)
}

export default validatePrimitive
