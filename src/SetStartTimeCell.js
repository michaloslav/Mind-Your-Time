import React from 'react';
import TimeSetter from './TimeSetter'
import TableCell from '@material-ui/core/TableCell';

// used in the ProjectsTable, both when adding and editing projects
const SetStartTimeCell = props => (
  <TableCell className="setStartTimeCell">
    <div className="setStartTimeLabelDiv">
      <label htmlFor={props.firstInputId}>
        Start:
      </label>
    </div>
    <TimeSetter
      onChange={props.onChange}
      value={props.value}
      firstInputId={props.firstInputId}
      hError={props.hError}
      mError={props.mError}
      onEnterPress={props.onEnterPress}
    />
  </TableCell>
)

export default SetStartTimeCell
