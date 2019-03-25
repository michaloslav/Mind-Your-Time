import React from 'react';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import HelpIcon from '@material-ui/icons/Help';
import { Doughnut } from 'react-chartjs-2';
import TimeCalc from './util/TimeCalc'
import './css/TimeStatsModal.css'

function addToDoughnutData(doughnutData, project, progress){
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
  props.projects.forEach(project => {
    let duration = parseInt(project.estimatedDuration)
    if(project.state === "done"){
      totalDoneTimeSoFar += duration
      addToDoughnutData(doughnutData, project, duration)
    }
    else{
      let progress = 0
      if(project.progress) progress += parseInt(project.progress)
      if(project.state === "workingOnIt" && project.startedWorkingOnIt){
        progress += TimeCalc.subtractToMinutes(props.currentTime, project.startedWorkingOnIt, true)
      }

      if(progress > duration) progress = duration

      totalDoneTimeSoFar += progress
      totalTimeToBeDone += (duration - progress)
      addToDoughnutData(doughnutData, project, progress)
    }

    predictedUnproductiveTime += Math.round(duration * bufferTimePercentage)
  })
  let totalTimePassed = TimeCalc.subtractToMinutes(props.currentTime, props.startTime, true)
  let timeUntilPredictedEndTime = TimeCalc.subtractToMinutes(predictedEndTime, props.currentTime, true)
  let productivityPercentageSoFar = Math.round(100 * totalDoneTimeSoFar / totalTimePassed)
  let predictedProductivityPercentage = Math.round(100 * (totalDoneTimeSoFar + totalTimeToBeDone) / (totalTimePassed + timeUntilPredictedEndTime))

  // push the unproductive time so far to the doughnutData
  let unproductiveTime = totalTimePassed - totalDoneTimeSoFar
  unproductiveTime = Math.round(unproductiveTime / roundTo) * roundTo
  addToDoughnutData(doughnutData, {name: "Unproductive time", color: "#aaa"}, unproductiveTime)

  // finish calculating the predictedUnproductiveTime
  for(let el of props.breaks){
    predictedUnproductiveTime += TimeCalc.subtractToMinutes(el.endTime, el.startTime, true)
  }
  predictedUnproductiveTime = Math.round(predictedUnproductiveTime / roundTo) * roundTo

  doughnutData.datasets[1].backgroundColor.push("#aaa")
  doughnutData.datasets[1].data.push(predictedUnproductiveTime)

  return (
    <div className="TimeStatsModal">
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
            options={{maintainAspectRatio: false, legend: {position: "bottom"}}}
          />
        </div>
      </div>
    </div>
  )
}

export default TimeStatsModal
