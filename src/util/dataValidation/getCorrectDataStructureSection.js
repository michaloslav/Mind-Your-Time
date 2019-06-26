import correctDataStructure from './correctDataStructure'

function getCorrectDataStructureSection(keys){
  if(typeof keys === "string") console.warn("Keys must be an array!")

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

export default getCorrectDataStructureSection
