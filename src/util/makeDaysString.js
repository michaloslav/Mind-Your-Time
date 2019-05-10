const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const shortDayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

// adds commas and the & character
function joinNames(names){
  let result = ""
  let length = names.length
  names.forEach((name, i) => {
    result += name
    if(i === length - 2) result += " & "
    if(i < length - 2) result += ", "
  })
  return result
}

// takes the days object of a defaultProject (which is an array of 7 bools) and creates a string representation of it
export default function makeDaysString(days, shortVersion = false){
  if(!days) return "Every day" // if it's not defined, assume it's all true

  // count how many true values there are in the array
  let positives = days.filter(val => val)
  let positiveCount = positives.length

  if(positiveCount === 7) return "Every day"
  if(positiveCount === 0) return "Never"

  let namesArr = shortVersion ? shortDayNames : dayNames

  // if almost all the values are true, return somthing like "Every day except Sunday"
  if(positiveCount >= 5){
    let negativeDayNames = []
    days.forEach((val, i) => {
      if(!val) negativeDayNames.push(namesArr[i])
    })

    let result = shortVersion ? 'All' : 'Every day'
    result += ' except ' + joinNames(negativeDayNames)
    return result
  }

  // if there aren't that many true values, simply list the days
  else{
    let positiveDayNames = []
    days.forEach((val, i) => {
      if(val) positiveDayNames.push(namesArr[i])
    })
    return joinNames(positiveDayNames)
  }
}
