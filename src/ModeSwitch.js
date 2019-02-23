import React from 'react';
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'

export default function ModeSwitch(props) {
  let buttonsArray = [{label: "Plan", val: "planning"}, {label: "Work", val: "working"}]
  let buttons = buttonsArray.map(el => (
    <Grid key={el.val}>
      <Button
        onClick={props.onModeChange.bind(this, el.val)}
        variant="fab"
        color={el.val === props.mode ? 'primary' : null}>
        {el.label}
      </Button>
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
