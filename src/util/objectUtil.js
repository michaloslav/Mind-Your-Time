// simple util function for checking if objects are identical
export function areIdenticalObjects(obj1, obj2){
  if(!obj2) return false

  // get the keys
  let keys
  if(Array.isArray(obj1)){
    if(!Array.isArray(obj2)) return false

    keys = obj1.keys()

    if(obj1.length !== obj2.length) return false
  }
  else{
    if(Array.isArray(obj2)) return false

    keys = Object.keys(obj1)

    if(keys.length !== Object.keys(obj2).length) return false
  }

  // make sure both object have the same keys


  for(let key of keys){
    if(typeof obj1[key] === "object"){
      if(!areIdenticalObjects(obj1[key], obj2[key])) return false
    }
    else{
      if(obj1[key] !== obj2[key]) return false
    }
  }

  return true
}

// uses oldData first, then rewrites it using the properties of newData to make sure all the properties are represented
// (in other words the newData value is always used but if a property of oldData isn't present in newData, that value is used too)
// usually oldData is considerably larger, hence the algorithm design
export function mergeObjects(oldData, newData){
  let mergedData = JSON.parse(JSON.stringify(oldData))
  for(let [key, val] of Object.entries(newData)){
    if(typeof val === "object" && typeof val.getTime !== "function"){
      let oldVal = oldData[key]
      if(!oldVal) oldVal = {} // handle undefined
      mergedData[key] = mergeObjects(oldVal, val)
    }
    else mergedData[key] = val
  }
  return mergedData
}
