export default class TimeCalc {
  static toMinutesSinceMidnight(time, keepPositiveIfCrossingMidnight = false){

    // if the argument is a number, simply return it
    if(typeof time === "number") return time
    // if it's a string, try to parse it
    if(typeof time === "string"){
      let parsedTime = parseInt(time)
      if(!isNaN(parsedTime)) return parsedTime
      else{
        console.warn("Unexpected input: ", time)
        return
      }
    }

    // else assume it's an object (if not, throw a warning)
    if(typeof time !== "object"){
      console.warn("Unexpected input: ", time)
      return
    }

    // handle time.h === 12
    let parsedH = parseInt(time.h)
    if(parsedH === 12) parsedH -= 12

    let result = parsedH * 60 + parseInt(time.m)
    if(time.pm) result += 12 * 60

    if(keepPositiveIfCrossingMidnight &&
      this.isBiggerThan(time, 0, true) &&
      this.isBiggerThan(5*60, time, true)
    ) result += 24*60

    return result
  }

  static toTimeObject(minutes, setPm = true){
    let pm = false
    if(setPm){

      // check for am/pm
      while(minutes >= 24 * 60){
        minutes -= 24*60
      }
      if(minutes >= 12 * 60){
        pm = true
        minutes -= 12*60
      }
    }

    // split hours and minutes
    let m = minutes % 60
    let h = (minutes - m) / 60

    if(isNaN(h) || isNaN(m)) console.warn("NaN result: ", {h, m, pm});

    if(setPm) return {h, m, pm}
    else return {h, m}
  }

  // add and return resultInMinutes
  // used internally
  static addToMinutes(){
    // make both an array input and a spread input acceptable
    let times = Array.isArray(arguments[0]) ? arguments[0] : arguments

    // convert to minutes
    let resultInMinutes = 0
    for(let i = 0; i < times.length; i++){
      resultInMinutes += this.toMinutesSinceMidnight(times[i])
    }

    return resultInMinutes
  }

  static add(){
    return this.toTimeObject(this.addToMinutes(...arguments))
  }

  // subtract and return resultInMinutes
  // used internally in subtract and isBiggerThan
  static subtractToMinutes(time1, time2, keepPositiveIfCrossingMidnight = false){
    let mins1 = this.toMinutesSinceMidnight(time1, keepPositiveIfCrossingMidnight)
    let mins2 = this.toMinutesSinceMidnight(time2, keepPositiveIfCrossingMidnight)
    let resultInMinutes = mins1 - mins2

    return resultInMinutes
  }

  static subtract(time1, time2, keepPositiveIfCrossingMidnight = false){
    let resultInMinutes = this.subtractToMinutes(time1, time2, keepPositiveIfCrossingMidnight)

    return this.toTimeObject(resultInMinutes, false)
  }

  static makeString(time, showPmOrAm = true, convert0To12EvenIfNotShowingPmOrAm = false, timeFormat24H = false){
    // handle a number input
    if(typeof time === "number") time = this.toTimeObject(time, showPmOrAm)

    let h, m

    if(timeFormat24H)showPmOrAm = false

    if(typeof time.m === "string") time.m = parseInt(time.m) // handle string input
    m = time.m >= 10 ? time.m : "0" + time.m

    h = ((showPmOrAm || convert0To12EvenIfNotShowingPmOrAm) && time.h === 0) ? 12 : time.h

    if(timeFormat24H && time.pm) h = parseInt(h) + 12

    // handle NaN
    if(isNaN(m)){
      console.warn("Wrong input to makeString: ", time);
      return
    }

    let string = h + ":" + m
    if(typeof time.pm !== "undefined" && showPmOrAm){
      let pmOrAm = time.pm ? "PM" : "AM"
      string += " " + pmOrAm
    }
    return string
  }

  static round(time, precision){
    let timeInMinutes = this.toMinutesSinceMidnight(time)

    // round the minutes
    timeInMinutes = Math.round(timeInMinutes / precision) * precision

    return this.toTimeObject(timeInMinutes)
  }

  static isBiggerThan(time1, time2, orEqual = true, keepPositiveIfCrossingMidnight = false){
    let difference = this.subtractToMinutes(time1, time2, keepPositiveIfCrossingMidnight)
    if(orEqual) return difference >= 0
    else return difference > 0
  }

  static areIdentical(){
    let temp

    for(let i = 0; i < arguments.length; i++){
      let argument = arguments[i]

      // handle NaN
      if(isNaN(argument.h)) argument.h = argument.h.toString()
      if(isNaN(argument.m)) argument.m = argument.m.toString()

      // handle string input
      if(typeof argument.h === "string") argument.h = parseInt(argument.h)
      if(typeof argument.m === "string") argument.m = parseInt(argument.m)

      // if temp is empty -> this is the first argument, store the first temp
      if(!temp){
        temp = argument
        continue
      }

      // if the temp and the current argument are not identical, return false
      if(argument.h !== temp.h || argument.m !== temp.m || argument.pm !== temp.pm) return false

      // store the current argument as the new temp
      temp = argument
    }

    return true
  }

  static suggestStartTime(previousEndTime, previousDuration, settings){
    let exactStartTime = this.add(previousEndTime, previousDuration * settings.bufferTimePercentage)

    // round the startTime to the nearest 5 and return
    return this.round(exactStartTime, settings.roundTo)
  }

  static average(){
    let sum = this.addToMinutes(...arguments)

    let average = Math.round(sum / arguments.length)

    return this.toTimeObject(average)
  }
}


// takes ordered projects and sets appropriate times for each of them
export function setTimesForProjects(projects, settings, breaks, startTime){

  // PSEUDO CODE: //
  // determine if a project and a break overlay
    // project.startTime < break.startTime && project.endTime > break.startTime
  // prioritize perserving break length or start and end times?
  // project 9:30-11:00, break 10:30-11:00 -> move break to 11:00-11:30
  // project 9:30-10:30, break 9:50-10:00 -> move break to 9:30-9:40, move project to 9:40-10:40
  // first determine if the break is in the first or second half of the project
    // compare the middle of the break to the middle of the project
  // if in the first, move the break to before the project, set project startTime = break[i].endTime
  // if the second, move the break to after the project, set startTime of the next project to break[i].endTime

  // break the reference to this.state.breaks
  breaks = JSON.parse(JSON.stringify(breaks))

  // calculate middleTimes beforehand to avoid multiple executions of the same code (-> improves performance)
  let middleTimes = {projects: [], breaks: []}
  for(let i = 0; i < projects.length; i++) middleTimes.projects[i] = TimeCalc.average(projects[i].plannedTime.start, projects[i].plannedTime.end)
  for(let i = 0; i < breaks.length; i++) middleTimes.breaks[i] = TimeCalc.average(breaks[i].startTime, breaks[i].endTime)

  for(let i = 0; i < projects.length; i++){

    // unless this is the first project, adjust the startTime
    if(i !== 0){
      projects[i].plannedTime.start = TimeCalc.suggestStartTime(
        projects[i - 1].plannedTime.end,
        projects[i - 1].estimatedDuration,
        settings
      )
    }

    // if it is the first project then startTime must equal the one from the state
    else projects[i].plannedTime.start = startTime

    // set the appropriate endTime
    projects[i].plannedTime.end = TimeCalc.add(projects[i].plannedTime.start, projects[i].estimatedDuration)

    // loop through the breaks, adjust if one of them overlays with the project
    for(let j = 0; j < breaks.length; j++){
      // if breaks[j] and projects[i] overlay...
      // (we only care about breaks[j].startTime, the endTime is irrelevant here)
      // (projectOverlapAreaStart is a way to handle the scenario of the break starting in the buffer, it also handles i === 0)
      let projectOverlapAreaStart = i === 0 ? projects[i].plannedTime.start : projects[i - 1].plannedTime.end
      if(
        TimeCalc.isBiggerThan(projects[i].plannedTime.end, breaks[j].startTime, true, true) &&
        TimeCalc.isBiggerThan(breaks[j].startTime, projectOverlapAreaStart, true, true)
      ){
        // determine if the break is in the first or second half of the project
        let breakIsInFirstHalf = TimeCalc.isBiggerThan(middleTimes.projects[i], middleTimes.breaks[j], true, true)

        // get the length of the break
        let lengthOfBreak = TimeCalc.subtractToMinutes(breaks[j].endTime, breaks[j].startTime, true)

        // if the break is in the first half of the project...
        if(breakIsInFirstHalf){
          // move the break before the project
          // (if it's the first project, there is no, projects[i - 1] -> handles undefined with ternary statement)
          breaks[j].startTime = (i === 0 ? projects[i].plannedTime.start : projects[i - 1].plannedTime.end)

          // adjust the endTime of the break
          breaks[j].endTime = TimeCalc.add(breaks[j].startTime, lengthOfBreak)

          // move the project after the break
          if(i === 0) projects[i].plannedTime.start = breaks[j].endTime // if it's the first project, move the startTime after the break
          // else add the buffer
          else projects[i].plannedTime.start = TimeCalc.suggestStartTime(breaks[j].endTime, projects[i-1].estimatedDuration, settings)
          projects[i].plannedTime.end = TimeCalc.add(projects[i].plannedTime.start, projects[i].estimatedDuration)
        }

        // if the break is in the second half of the project...
        else{
          // move the break after the project
          breaks[j].startTime = projects[i].plannedTime.end
          breaks[j].endTime = TimeCalc.add(breaks[j].startTime, lengthOfBreak)
        }
      }
    }
  }

  return projects
}
