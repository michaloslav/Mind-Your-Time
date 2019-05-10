import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import Tooltip from '@material-ui/core/Tooltip';
import TimeCalc from './util/TimeCalc'

// displays the startTime and endTime with the relevant styling, Tooltip etc.
const ProjectsTableTimeCell = props => {
  let cellContent = (
    <div>
      <span
        className={props.startIsTooLate && props.stateClass === "stateClassTooLate"  ? props.stateClass : null}
      >
        {TimeCalc.makeString(props.row.plannedTime.start,
          props.row.plannedTime.start.pm !== props.row.plannedTime.end.pm,
          true,
          props.timeFormat24H
        ) /*showPmOrAm only if it's different from the endTime*/}
      </span>
      <span
        className={props.startIsTooLate && props.endIsTooLate && props.stateClass === "stateClassTooLate" ? props.stateClass : null}
      >
        -
      </span>
      <span
        className={props.endIsTooLate && props.stateClass !== "stateClassDone" ? "stateClassTooLate" : null}
      >
        {TimeCalc.makeString(props.row.plannedTime.end, true, false, props.timeFormat24H)}
      </span>
    </div>
  )

  return (
    <TableCell className={props.showEditing ? "setStartTimeCell" : null}>
      {props.isMobile ? (
        <Tooltip
          title={props.progress + "/" + props.row.estimatedDuration + " done"}
          disableFocusListener disableTouchListener
          children={cellContent}
        />
      ) : cellContent}
    </TableCell>
  )
}

export default ProjectsTableTimeCell
