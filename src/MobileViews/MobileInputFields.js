import React from 'react'
import BackButton from './BackButton'
import TimeSetter from '../TimeSetter'
import ColorPicker from '../ColorPicker'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography';
import '../css/MobileInputFields.css'

const MobileInputFields = props => (
  <Grid className="MobileInputFields container">
    <BackButton onClick={props.close} />
    <Grid className="buttonTop">
      {props.buttonTop}
    </Grid>
    {props.title && (
      <Typography className="title" variant="h6" children={props.title} />
    )}
    <Grid style={props.title ? {} : {paddingTop: "1.5rem"}}>
      <TextField
        value={props.inputValues.name}
        onChange={props.onInputChange.bind(this, "name")}
        onKeyPress={props.onKeyPress}
        placeholder="Name"
        aria-label="Name"
        error={props.showErrors.name || props.showErrorProp}
        fullWidth
        margin="normal"
        autoFocus
      />
    </Grid>
    <Grid className="durationAndStartTimeDiv" container justify="space-between">
      {props.type !== "break" && (
        <Grid
          item
          xs={props.type === "default" ? 12 : 6}
          className="item"
        >
          <label>Duration:</label>
          <TextField
            type="number"
            value={props.inputValues.duration}
            onChange={props.onInputChange.bind(this, "duration")}
            onKeyPress={props.onKeyPress}
            placeholder="Duration"
            aria-label="Duration"
            error={props.showErrors.duration || props.showErrorProp}
          />
        </Grid>
      )}
      {props.type !== "default" && (
        <Grid item xs={6} className="item">
          <label>Start:</label>
          <TimeSetter
            value={props.inputValues.startTime}
            onChange={props.onTimeInputChange.bind(this, "startTime")}
            firstInputId="newProjectStartTimeInput"
            hError={props.showErrors.startTimeH || props.showErrorProp}
            mError={props.showErrors.startTimeM || props.showErrorProp}
            showErrors={props.showErrors}
            onEnterPress={props.add}
          />
        </Grid>
      )}
      {props.type === "break" && (
        <Grid item xs={6} className="item">
          <label>End:</label>
          <TimeSetter
            value={props.inputValues.endTime}
            onChange={props.onTimeInputChange.bind(this, "endTime")}
            firstInputId="newProjectEndTimeInput"
            hError={props.showErrors.endTimeH || props.showErrors.endTime || props.showErrorProp}
            mError={props.showErrors.endTimeM || props.showErrors.endTime || props.showErrorProp}
            showErrors={props.showErrors}
            onEnterPress={props.add}
          />
        </Grid>
      )}
    </Grid>
    {props.type !== "break" && (
      <Grid>
        Color:
        <ColorPicker xl
          value={props.inputValues.color}
          onChange={props.onColorChange}
        />
      </Grid>
    )}
    <Grid className="confirmDiv" container justify="center">
      {props.button}
    </Grid>
  </Grid>
)

export default MobileInputFields
