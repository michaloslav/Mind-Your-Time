import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';

export default class ProductivityLineChart extends Component{
  constructor(props){
    super(props)
    this.state = {
      scale: "1w" // show the last week by default
    }
  }

  render(){
    // line out the data structure
    var lineChartData = {
      datasets: [{
        data: [],
        borderColor: "rgba(00, 208, 83, .5)",
        label: "Productivity percentage",
        fill: false,
        pointBackgroundColor: "rgba(00, 208, 83, .5)"
      }],
      labels: []
    }

    // apply the scale
    var scaleInMs
    // this is the Date that serves as a line between data that is displayed and data that isn't
    var scaleBreakpoint = 0
    switch (this.state.scale) {
      case "1w":
        scaleInMs = 7*24*60*60*1000
        break;
      case "1m":
        scaleInMs = 30*24*60*60*1000
        break;
      case "3m":
        scaleInMs = 3*30*24*60*60*1000
        break;
      case "6m":
        scaleInMs = 6*30*24*60*60*1000
        break;
      case "1y":
        scaleInMs = 365*24*60*60*1000
        break;
      default:
    }
    if(scaleInMs) scaleBreakpoint = new Date(new Date().getTime() - scaleInMs)
    let prodPercArr = []
    for(let {date, perc} of this.props.prodPercArr){
      date = new Date(date)
      if(date >= scaleBreakpoint) prodPercArr.push({date, perc})
    }

    // check if there are any days without associated values
    // (if the user doesn't use the app for a few days, we want it to be visible in the chart)
    let prevDate, oneDayInMs = 24*60*60*1000
    prodPercArr.forEach(({date, perc}, i) => {
      date = new Date(date)
      // check if there are any days between the one being processed and the one before it
      if(prevDate && (date.getTime() > prevDate.getTime() + oneDayInMs)){
        // add all the missing dates between prevDate and date, fill the values with null
        let lastDateInDataset = prevDate
        while(date.getTime() > lastDateInDataset.getTime() + oneDayInMs){
          let dateToAdd = new Date(lastDateInDataset.getTime() + oneDayInMs)

          prodPercArr.splice(i, 0, {date: dateToAdd.toLocaleDateString(), perc: null})

          lastDateInDataset = dateToAdd
        }
      }

      prevDate = date
    })

    // figure out how many values to show
    // (if the user wants to see data of the whole year, we don't want to have to show 365 datapoints)
    let datapointsToShow = Math.round(window.innerWidth / 50)
    // eg. if ratioToShow === 5, show one value per 5 datapoints
    let ratioToShow = Math.round(prodPercArr.length / datapointsToShow)
    if(!ratioToShow) ratioToShow = 1 // handle prodPercArr.length < datapointsToShow
    let counter = 0, sumCounter = 0

    // if ratioToShow is 5, we want to set up a counter that will let us only show every 5th datapoint
    // we also want to show the average of those 5 datapoints instead of showing the 5th one alone
    for(let {date, perc} of prodPercArr){
      counter++
      sumCounter += perc
      if(counter < ratioToShow) continue
      let average = sumCounter / ratioToShow
      counter = sumCounter = 0

      // since we're showing the average value, we want to show the average Date as well
      let avgDate = ratioToShow === 1 ? new Date(date) : new Date(date.getTime() - (ratioToShow * oneDayInMs/2))

      lineChartData.datasets[0].data.push(average)
      lineChartData.labels.push(avgDate.toLocaleDateString())
    }

    return (
      <div>
        <InputLabel htmlFor="lineChartScaleSelect" children="Scale: " />
        <Select
          value={this.state.scale}
          onChange={e => this.setState({scale: e.target.value})}
          inputProps={{id: 'lineChartScaleSelect'}}
        >
          <MenuItem value="1w">Last Week</MenuItem>
          <MenuItem value="1m">Last Month</MenuItem>
          <MenuItem value="3m">Last 3 Months</MenuItem>
          <MenuItem value="6m">Last 6 Months</MenuItem>
          <MenuItem value="1y">Last Year</MenuItem>
          <MenuItem value="a">All</MenuItem>
        </Select>
        <Line
          data={lineChartData}
          height={100}
          width={300}
          options={{
            maintainAspectRatio: false,
            legend: {position: "bottom"},
            spanGaps: true,
            animation: false
          }}
        />
      </div>
    )
  }
}
