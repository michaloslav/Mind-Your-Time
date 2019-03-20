import React, { Component } from 'react';
import TimeStatsModal from './TimeStatsModal'
import Grid from '@material-ui/core/Grid'
import Tooltip from '@material-ui/core/Tooltip'
import Dialog from '@material-ui/core/Dialog';
import TimeCalc from './util/TimeCalc'
import './css/TimeStats.css'

export default class TimeStats extends Component {
  constructor(props){
    super(props)
    this.state = {
      currentTimeAvailable: false, // stores whether the currentTime has been set (to prevent unnecessary and useless calculation on load)
      modalOpen: false
    }

    this.currentTimeUpdateInterval = setInterval(this.updateCurrentTime, 1000)
  }

  componentDidMount(){
    this.updateCurrentTime()
  }

  componentWillUnmount(){
    clearInterval(this.currentTimeUpdateInterval)
  }

  updateCurrentTime = () => {
    let currentTime = new Date()
    let m = currentTime.getMinutes()

    this.setState({currentTimeAvailable: true})

    // if it's still the same minute, there's no need to update the clock
    // (and if this isn't the initial time setting)
    if(m === this.props.currentTime.m && this.props.currentTime.h !== 0) return

    // format the time
    let h = currentTime.getHours()
    let pm = h >= 12
    h = h % 12
    h = h === 0 ? 12 : h

    // update the state
    this.props.onCurrentTimeChange({h, m, pm})
  }

  openModal = () => {
    this.setState({modalOpen: true})
  }

  render(){
    // calculate the stats
    // (if currentTime and settings are available)
    let totalProjectTime, totalBufferTime, totalBreakTime, timeNeeded, timeRemaining, timeNeededWarning, timeRemainingNegative, timeRemainingWarning

    if(this.state.currentTimeAvailable && this.props.settings.bufferTimePercentage){
      totalProjectTime = totalBufferTime = 0
      this.props.projects.forEach((project, i) => {
        if(project.state !== "done"){
          let durationLeft = parseInt(project.estimatedDuration)

          let progress = parseInt(project.progress)
          if(project.state === "workingOnIt" && project.startedWorkingOnIt){
            progress += TimeCalc.subtractToMinutes(this.props.currentTime, project.startedWorkingOnIt, true)
          }

          if(progress){
            if(progress > durationLeft) durationLeft = 0
            else durationLeft -= progress
          }

          totalProjectTime += durationLeft

          // if this isn't the last project, add a buffer time to the sum
          if(i !== this.props.projects.length - 1){
            totalBufferTime += Math.round(durationLeft * this.props.settings.bufferTimePercentage)
          }
        }
      })
      // round according to settings
      totalProjectTime = Math.round(totalProjectTime / this.props.settings.roundTo) * this.props.settings.roundTo
      totalBufferTime = Math.round(totalBufferTime / this.props.settings.roundTo) * this.props.settings.roundTo

      totalBreakTime = 0
      for(let el of this.props.breaks){
        let endTime = TimeCalc.toMinutesSinceMidnight(el.endTime, true)
        let currentTime = TimeCalc.toMinutesSinceMidnight(this.props.currentTime, true)

        // if the break has already passed, don't count it in
        if(TimeCalc.isBiggerThan(currentTime, endTime, false)) continue

        let startTime = TimeCalc.toMinutesSinceMidnight(el.startTime, true)

        // if the break hasn't started yet
        if(TimeCalc.isBiggerThan(startTime, currentTime, true)){
          totalBreakTime += TimeCalc.subtractToMinutes(endTime, startTime, true)
        }
        // if the break has started and is currently going on
        else totalBreakTime += TimeCalc.subtractToMinutes(endTime, currentTime, true)
      }
      // round totalBreakTime according to settings
      totalBreakTime = Math.round(totalBreakTime / this.props.settings.roundTo) * this.props.settings.roundTo

      timeNeeded = TimeCalc.toTimeObject(TimeCalc.addToMinutes(totalProjectTime, totalBufferTime, totalBreakTime), false)
      timeRemaining = TimeCalc.subtract(this.props.endTime, this.props.currentTime, true)

      // figure out which warnings to show
      timeNeededWarning = TimeCalc.isBiggerThan(timeNeeded, timeRemaining, false, false)
      timeRemainingNegative = !TimeCalc.isBiggerThan(timeRemaining, 0)
      timeRemainingWarning = timeRemainingNegative && this.props.endTime.h !== "" && this.props.endTime.m !== ""
    }
    else{
      // used if the currentTime or settings aren't available yet -> faster load time
      totalProjectTime = totalBufferTime = totalBreakTime = 0
      timeNeeded = timeRemaining = {h: 0, m: 0, pm: false}
      timeNeededWarning = timeRemainingNegative = timeRemainingWarning = false
    }

    return (
      <React.Fragment>
        <Grid item className={"timeStatsSideGridItem" + (timeNeededWarning ? " timeStatsWarning" : "")}>
          <Tooltip title={
            "Projects: " + TimeCalc.makeString(totalProjectTime, false) +
            ",\nBuffers: " + TimeCalc.makeString(totalBufferTime, false) +
            ",\nBreaks: " + TimeCalc.makeString(totalBreakTime, false) + " (click for more)"
          }>
            <div onClick={this.openModal}>
              <div className="timeStatsLabelDiv">
                <label>
                  {this.props.shortLabels ? "N" : "Time n"}eeded:
                </label>
              </div>
              {TimeCalc.makeString(timeNeeded, false)}
            </div>
          </Tooltip>
        </Grid>
        <Grid item>
          <h4>
            {TimeCalc.makeString(this.props.currentTime, true, false, this.props.settings.timeFormat24H)}
          </h4>
        </Grid>
        <Grid item className={"timeStatsSideGridItem" + (timeRemainingWarning ? " timeStatsWarning" : "")}>
          <div onClick={this.openModal}>
            <div className="timeStatsLabelDiv">
              <label>
                {this.props.shortLabels ? "R" : "Time r"}emaining:
              </label>
            </div>
            {timeRemainingNegative ? "0:00" : TimeCalc.makeString(timeRemaining, false)}
          </div>
        </Grid>
        <Dialog
          open={this.state.modalOpen}
          onClose={() => {this.setState({modalOpen: false})}}
          aria-label="Time Stats Modal"
        >
          <TimeStatsModal
            stats={{timeNeeded, totalProjectTime, totalBufferTime, totalBreakTime}}
            {...this.props}
          />
        </Dialog>
      </React.Fragment>
    )
  }
}
