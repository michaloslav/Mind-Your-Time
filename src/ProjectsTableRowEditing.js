import React from 'react';
import SetStartTimeCell from './SetStartTimeCell'
import TableCell from '@material-ui/core/TableCell';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import DoneIcon from '@material-ui/icons/Done';
import DeleteIcon from '@material-ui/icons/Delete';
import { SettingsContext, IsMobileContext } from './_Context'
import withEdit from './HOCs/withEdit'
import './css/ProjectsTableRow.css'

// just a display component, all the functionality is handled by withEdit
const ProjectsTableRowEditing = props => (
  <IsMobileContext.Consumer>
    {isMobile => (
      <React.Fragment>
        <TableCell className="setNameCell">
          <Input
            value={props.inputValues.name}
            onChange={props.onInputChange.bind(this, "name")}
            placeholder="Name"
            aria-label="Name"
            error={props.showErrors.name}
            onKeyPress={props.onKeyPress}
          />
        </TableCell>
        {(!isMobile || props.type === "default") && (
          <TableCell className="setDurationCell">
            <SettingsContext.Consumer>
              {({roundTo}) => (
                <Input
                  value={props.inputValues.duration}
                  onChange={props.onInputChange.bind(this, "duration")}
                  placeholder="Duration"
                  aria-label="Duration"
                  error={props.showErrors.duration}
                  onKeyPress={props.onKeyPress}
                  type="number"
                  inputProps={{step: roundTo}}
                />
              )}
            </SettingsContext.Consumer>
          </TableCell>
        )}

        {props.type !== "default" && (
          <SetStartTimeCell
            value={props.inputValues.startTime}
            onChange={props.onTimeInputChange.bind(this, "startTime")}
            firstInputId={"changeStartTimeInput" + props.id}
            hError={props.showErrors.startTimeH}
            mError={props.showErrors.startTimeM}
            onEnterPress={props.save}
          />
        )}

        {props.type === "default" && !isMobile && (
          <TableCell>
            <Button onClick={props.openDaysDialog} variant="outlined">
              Days
            </Button>
          </TableCell>
        )}

        <TableCell>
          <IconButton
            aria-label="Save changes"
            onClick={props.save}
            color="primary">
            <DoneIcon />
          </IconButton>
          {
            !isMobile && (
              <IconButton
                aria-label="Delete the project"
                onClick={props.delete}
                className="deleteIconButton">
                <DeleteIcon />
              </IconButton>
            )
          }
        </TableCell>
      </React.Fragment>
    )}
  </IsMobileContext.Consumer>
)

export default withEdit(ProjectsTableRowEditing)
