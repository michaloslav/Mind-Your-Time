// objects is an array of projects or breaks, key is either "projecs" or "breaks"
export default function makeNewId(objects, key){
  // make a new unique ID
  let newId
  let haveFoundUniqueId = false

  // if the ID isn't unique (in other words if it already exists in the state or local storage), try again
  while(!haveFoundUniqueId){
    newId = Math.floor(Math.random() * 10**8)
    haveFoundUniqueId = true

    // make sure the ID is unique within the state
    for(let i = 0; i < objects.length; i++){
      if(objects[i].id === newId){
        haveFoundUniqueId = false
        break
      }
    }
    // make sure there aren't any lastModified fields in the localStorage either
    if(haveFoundUniqueId){
      let localStorageKey = ["lastModified", key, newId, "id"].join("_")
      if(!isNaN(localStorage[localStorageKey])) haveFoundUniqueId = false
    }
  }

  return newId
}
