import React from 'react';
import ChangeProjectStateCell from './ChangeProjectStateCell'
import ProjectsTableTimeCell from './ProjectsTableTimeCell'
import TableCell from '@material-ui/core/TableCell';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import TimeCalc from './util/TimeCalc'
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import makeDaysString from './util/makeDaysString'
import { SettingsContext, IsMobileContext } from './_Context'
import './css/ProjectsTableRow.css'

// a simple display element for showing information about the project
const ProjectsTableRowDisplay = props => {
  let stateClass, startIsTooLate, endIsTooLate, timeLeft
  let {progress, progressCapped} = props
  if(!props.isDefaultProjects){
    timeLeft = parseInt(props.row.estimatedDuration) - progressCapped

    // get the stateClass (too late or done) and tableRowStyle (to display progress graphically)
    // figure out if the start and the end are late, if they are, show them in red
    startIsTooLate = !TimeCalc.isBiggerThan(
      TimeCalc.add(props.row.plannedTime.start, progressCapped),
      props.currentTime, true, true)

    let endTimeInMinutes = TimeCalc.toMinutesSinceMidnight(props.row.plannedTime.end, true)
    let bufferLength = props.row.estimatedDuration * props.settings.bufferTimePercentage
    endIsTooLate = !TimeCalc.isBiggerThan(
      // take the bufferTime into account (only show the end in red if currentTime > endTime + buffer)
      endTimeInMinutes + bufferLength,
      props.currentTime,
      true,true
    )

    if(props.row.state === "done") stateClass = "stateClassDone"
    else{
      if(startIsTooLate && props.row.state !== "workingOnIt"){
        stateClass = "stateClassTooLate"
      }
    }
  }

  return (
    <IsMobileContext.Consumer>
      {isMobile => (
        <React.Fragment>
          <TableCell className={stateClass} children={props.row.name} />
          {(!isMobile || props.isDefaultProjects) && (
            <TableCell>
              {progress && props.row.state !== "done" ? (
                <Tooltip title={progress + "/" + props.row.estimatedDuration + " done"}>
                  <span>
                    {timeLeft} minutes left
                  </span>
                </Tooltip>
              ) : (
                props.row.estimatedDuration + " minutes"
              )}
            </TableCell>
          )}

          {!props.isDefaultProjects && (
            <SettingsContext.Consumer>
              {settings => (
                <ProjectsTableTimeCell
                  showEditing={false}
                  startIsTooLate={startIsTooLate}
                  endIsTooLate={endIsTooLate}
                  stateClass={stateClass}
                  row={props.row}
                  timeFormat24H={settings.timeFormat24H}
                  isMobile={isMobile}
                  progress={progress}
                />
              )}
            </SettingsContext.Consumer>
          )}

          {props.isDefaultProjects && !isMobile && (
            <TableCell>
              {makeDaysString(props.row.days, window.innerWidth < 950)}
            </TableCell>
          )}

          {props.mode === "planning" ? (
            <TableCell>
              <IconButton
                aria-label="Edit the project"
                onClick={isMobile ? props.startEditingMobile.bind(this, props.row.id) : props.startEditing}>
                <EditIcon />
              </IconButton>
              {
                !isMobile && (
                  <IconButton
                    aria-label="Delete the project"
                    onClick={props.onDeleteProject.bind(this, props.row.id)}
                    className="deleteIconButton">
                    <DeleteIcon />
                  </IconButton>
                )
              }
            </TableCell>
          ) : (
            <ChangeProjectStateCell
              row={props.row}
              onProjectStateChange={props.onProjectStateChange}
              currentTime={props.currentTime}
              isMobile={isMobile}
              progressCapped={progressCapped}
            />
          )}
        </React.Fragment>
      )}
    </IsMobileContext.Consumer>
  )
}

export default ProjectsTableRowDisplay
