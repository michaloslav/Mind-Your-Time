import React from 'react';
import TimeSetter from './TimeSetter'

export default function EndTimeSetter(props){
  return (
    <div id="setEndTime">
      <label htmlFor="endTimeHoursInput">
        Time when you want to stop working:
      </label>
      <TimeSetter
        onChange={props.onChange}
        value={props.value}
        firstInputId="endTimeHoursInput"
        showError={props.showError} />
    </div>
  )
}
