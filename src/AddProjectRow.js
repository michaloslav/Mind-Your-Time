import React from 'react';
import ColorPicker from './ColorPicker'
import SetStartTimeCell from './SetStartTimeCell'
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Input from '@material-ui/core/Input';
import AddIcon from '@material-ui/icons/Add';
import IconButton from '@material-ui/core/IconButton';
import withAdd from './HOCs/withAdd'
import './css/AddProjectRow.css'

const AddProjectRow = props => (
  <TableRow id="addProjectRow">
    <TableCell>
      <ColorPicker
        value={props.inputValues.color}
        onChange={props.onColorChange} />
    </TableCell>
    <TableCell className="setNameCell">
      <div id="addProjectLabelDiv">
        <label htmlFor="addProjectNameInput">
          Add a project:
        </label>
      </div>
      <Input
        onChange={props.onInputChange.bind(this, "name")}
        value={props.inputValues.name}
        placeholder="Name"
        aria-label="Name"
        error={props.showErrors.name || props.showErrorProp}
        onKeyPress={props.onKeyPress}
        id="addProjectNameInput"
        autoFocus
      />
    </TableCell>
    <TableCell className="setDurationCell">
      <Input
        onChange={props.onInputChange.bind(this, "duration")}
        value={props.inputValues.duration}
        placeholder="Duration"
        aria-label="Duration"
        error={props.showErrors.duration || props.showErrorProp}
        onKeyPress={props.onKeyPress}
      /> minutes
    </TableCell>
    {props.type !== "default" && (
      <SetStartTimeCell
        onChange={props.onStartTimeChange}
        value={props.inputValues.startTime}
        firstInputId="setStartTimeInput"
        hError={props.showErrors.startTimeH || props.showErrorProp}
        mError={props.showErrors.startTimeM || props.showErrorProp}
        showErrors={props.showErrors}
        onEnterPress={props.add}
      />
    )}
    <TableCell>
      <IconButton color="primary"
        style={{color: props.showErrorProp ? "red" : null}}
        aria-label="Add the new project"
        onClick={props.add}>
        <AddIcon />
      </IconButton>
    </TableCell>
  </TableRow>
)

export default withAdd(AddProjectRow)
