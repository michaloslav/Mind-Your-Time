import React from 'react';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import HelpIcon from '@material-ui/icons/Help';
import { Doughnut } from 'react-chartjs-2';
import TimeCalc from './util/TimeCalc'
import './css/TimeStatsModal.css'

// a util function used to cnvert the data and push it into the data that will be used to show a doughnut chart
function addProjectToDoughnutData(doughnutData, project, progress){
  doughnutData.datasets[0].backgroundColor.push(project.color)
  doughnutData.datasets[0].data.push(progress)
  doughnutData.labels.push(project.name)

  if(project.estimatedDuration){
    doughnutData.datasets[1].backgroundColor.push(project.color)
    doughnutData.datasets[1].data.push(project.estimatedDuration)
  }
}

const TimeStatsModal = props => {
  let { timeFormat24H, roundTo, bufferTimePercentage } = props.settings

  // calculate some basic stats
  let predictedEndTime = TimeCalc.round(TimeCalc.add(props.currentTime, props.stats.timeNeeded), roundTo)
  let plannedMinusPredictedEndTimePositive = TimeCalc.isBiggerThan(props.endTime, predictedEndTime, false, true)
  // make sure the input to makeString is positive
  let plannedMinusPredictedEndTime
  if(plannedMinusPredictedEndTimePositive){
    plannedMinusPredictedEndTime = TimeCalc.round(TimeCalc.subtract(props.endTime, predictedEndTime, true), roundTo)
  }
  else{
    plannedMinusPredictedEndTime = TimeCalc.round(TimeCalc.subtract(predictedEndTime, props.endTime, true), roundTo)
  }

  let totalDoneTimeSoFar = 0, totalTimeToBeDone = 0, predictedUnproductiveTime = 0
  let doughnutData = {
    datasets: [
      {
        label: "Actual",
        backgroundColor: [],
        data: []
      },
      {
        label: "Planned",
        backgroundColor: [],
        data: []
      }
    ],
    labels: []
  }

  // add each project to doughnutData
  props.projects.forEach(project => {
    // calculate its duration, determine what should be added to doughnutData
    // (if the project is finished, add the whole thing to both charts, else calculate progress)
    let duration = parseInt(project.estimatedDuration)
    if(project.state === "done"){
      totalDoneTimeSoFar += duration
      addProjectToDoughnutData(doughnutData, project, duration)
    }
    else{
      let progress = 0
      if(project.progress) progress += parseInt(project.progress)
      if(project.state === "workingOnIt" && project.startedWorkingOnIt){
        progress += TimeCalc.subtractToMinutes(
          {...props.currentTime, s: new Date().getSeconds()},
          project.startedWorkingOnIt,
          true
        )
      }

      if(progress > duration) progress = duration

      totalDoneTimeSoFar += progress
      totalTimeToBeDone += (duration - progress)
      addProjectToDoughnutData(doughnutData, project, progress)
    }

    predictedUnproductiveTime += Math.round(duration * bufferTimePercentage)
  })

  // add breaks to doughnutData
  props.breaks.forEach(breakInfo => {
    let breakDuration = TimeCalc.subtractToMinutes(breakInfo.endTime, breakInfo.startTime, true)
    let color = "#bbb" // the color used for all breaks universally

    // add the break to the "planned" chart
    doughnutData.labels.push(breakInfo.name)
    doughnutData.datasets[1].backgroundColor.push(color)
    doughnutData.datasets[1].data.push(breakDuration)

    // add the break to the "your day so far" chart
    let durationSoFar = 0
    // determine durationSoFar
    if(TimeCalc.isBiggerThan(props.currentTime, breakInfo.startTime, false, true)){

      // determine what part of the break to add
      if(TimeCalc.isBiggerThan(props.currentTime, breakInfo.endTime, true, true)){
        // add the whole break
        durationSoFar = breakDuration
      }
      else{
        // only add the part that has taken place already
        durationSoFar = TimeCalc.subtractToMinutes(props.currentTime, breakInfo.startTime, true)
      }
    }
    doughnutData.datasets[0].backgroundColor.push(color)
    doughnutData.datasets[0].data.push(durationSoFar)
  })

  // if realEndTime is available, convert and use it, else use currentTime
  let realEndTime
  if(props.realEndTime){
    let date = new Date(props.realEndTime)
    let h = date.getHours()
    let m = date.getMinutes()
    if(date.getSeconds() >= 30) m++ // handle seconds
    let pm = false
    if(h > 12){
      h -= 12
      pm = true
    }
    realEndTime = {h, m, pm}
  }

  // calculate some more stats
  let totalTimePassed = TimeCalc.subtractToMinutes(realEndTime || props.currentTime, props.startTime, true)
  let timeUntilPredictedEndTime = TimeCalc.subtractToMinutes(predictedEndTime, props.currentTime, true)
  let productivityPercentageSoFar = Math.round(100 * totalDoneTimeSoFar / totalTimePassed)
  let predictedProductivityPercentage = Math.round(100 * (totalDoneTimeSoFar + totalTimeToBeDone) / (totalTimePassed + timeUntilPredictedEndTime))

  // push the unproductive time so far to the doughnutData
  let unproductiveTime = totalTimePassed - totalDoneTimeSoFar
  unproductiveTime = Math.round(unproductiveTime / roundTo) * roundTo
  addProjectToDoughnutData(doughnutData, {name: "Unproductive time", color: "#aaa"}, unproductiveTime)

  // finish calculating the predictedUnproductiveTime
  for(let el of props.breaks){
    predictedUnproductiveTime += TimeCalc.subtractToMinutes(el.endTime, el.startTime, true)
  }
  predictedUnproductiveTime = Math.round(predictedUnproductiveTime / roundTo) * roundTo

  // push predictedUnproductiveTime to the doughnutData
  doughnutData.datasets[1].backgroundColor.push("#aaa")
  doughnutData.datasets[1].data.push(predictedUnproductiveTime)

  var textColor = props.settings.darkTheme ? "white" : "black"


  //console.warn("Conditional debugger")
  //if(isNaN(productivityPercentageSoFar) || isNaN(predictedProductivityPercentage)) debugger

  return (
    <div className="TimeStatsModal" style={{color: textColor}}>
      <Typography variant="h6">
        You need {TimeCalc.makeFullLengthDurationString(props.stats.timeNeeded)}
      </Typography>
      <b>{TimeCalc.makeString(props.stats.totalProjectTime, false, false, timeFormat24H)}</b> for projects
      <br/>
      {TimeCalc.makeString(props.stats.totalBufferTime, false, false, timeFormat24H)} for buffers
      <br/>
      {TimeCalc.makeString(props.stats.totalBreakTime, false, false, timeFormat24H)} for breaks
      <div className="section">
        At the current pace, you'll be done at <b>{TimeCalc.makeString(predictedEndTime, true, false, timeFormat24H)}</b>
        <br/>
        That's
        <b>
          <span> </span>
          {TimeCalc.makeFullLengthDurationString(plannedMinusPredictedEndTime)}
          <span> </span>
          {plannedMinusPredictedEndTimePositive ? "earlier" : "later"}
        </b>
        <span> </span>
        than what you planned
      </div>
      {!isNaN(productivityPercentageSoFar) && productivityPercentageSoFar >= 0 && productivityPercentageSoFar <= 100 && (
        <div className="section">
          You've been productive <b>{productivityPercentageSoFar}%</b> of the time so far
          <br/>
          Assuming you're done at {TimeCalc.makeString(predictedEndTime, true, false, timeFormat24H)},
          <br/>
          your productivity percentage will be
          <span> </span>
          {predictedProductivityPercentage < productivityPercentageSoFar ? (
            <Tooltip disableFocusListener disableTouchListener
              title={
                `Your predicted productivity percentage is lower then your current one because of buffer times.
                You can learn more about buffer times in the about section.`
              }
            >
              <b>
                {predictedProductivityPercentage}%
              </b>
            </Tooltip>
          ) : (
            <b>
              {predictedProductivityPercentage}%
            </b>
          )}
        </div>
      )}
      <div className="section">
        <Typography variant="h6">
          Your day so far:
          <Tooltip disableFocusListener disableTouchListener
            title={
              `The inner circle represents your day as you planned it,
              the outer one represents your day so far
              (starting at ${TimeCalc.makeString(props.startTime, true, false, timeFormat24H)})`
            }
          >
            <HelpIcon className="helperIcon" />
          </Tooltip>
        </Typography>
        <div>
          <Doughnut
            data={doughnutData}
            width={250}
            height={200 + doughnutData.datasets[0].data.length * 4}
            options={{maintainAspectRatio: false, legend: {position: "bottom", labels: {fontColor: textColor}}}}
          />
        </div>
      </div>
    </div>
  )
}

export default TimeStatsModal
