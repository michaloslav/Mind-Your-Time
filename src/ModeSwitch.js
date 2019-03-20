import React from 'react';
import Fab from '@material-ui/core/Fab'
import Grid from '@material-ui/core/Grid'
import './css/ModeSwitch.css'

export default function ModeSwitch(props) {
  let buttonsArray = [{label: "Plan", val: "planning"}, {label: "Work", val: "working"}]
  let buttons = buttonsArray.map(el => (
    <Grid key={el.val}>
      <Fab
        onClick={props.onModeChange.bind(this, el.val)}
        color={el.val === props.mode ? 'primary' : null}>
        {el.label}
      </Fab>
    </Grid>
  ))

  return (
    <Grid
      className="ModeSwitch"
      container
      alignItems='baseline'
      justify="space-between">
      {buttons[0]}
      {props.children}
      {buttons[1]}
    </Grid>
  );
}
