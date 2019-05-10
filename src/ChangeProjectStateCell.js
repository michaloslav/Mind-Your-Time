import React from 'react';
import SetProgressAndPauseButton from './SetProgressAndPauseButton'
import ChangeProjectStateDropdown from './ChangeProjectStateDropdown'
import TableCell from '@material-ui/core/TableCell';
import IconButton from '@material-ui/core/IconButton';
import DoneIcon from '@material-ui/icons/Done';
import StartIcon from '@material-ui/icons/PlayArrow';
import UndoIcon from '@material-ui/icons/Undo';
import './css/ChangeProjectStateCell.css'

// a simple display only component that lets the user edit a project's state
export default function ChangeProjectStateCell(props){
  // there are always 1-2 buttons, which ones depends on isMobile and the current state of the project
  // the mobile UI can only fit 1 button, desktop can fit 2
  let content = []
  // if the project is done, show an undo button (to let the user go back to "paused") and on desktop, show a "done" span
  if(props.row.state === "done"){
    if(!props.isMobile) content.push(<span key="doneSpan" className="done">DONE</span>)
    content.push(
      <IconButton
        key="undo"
        aria-label="Mark project as undone"
        onClick={props.onProjectStateChange.bind(this, props.row.id, "paused")}
      >
        <UndoIcon/>
      </IconButton>
    )
  }
  else{
    // if the state is "workingOnIt", show a pause button and a done button on desktop and a dropdown with these option on mobile
    if(props.row.state === "workingOnIt"){
      if(props.isMobile){
        content.push(
          <ChangeProjectStateDropdown
            key="dropdown"
            row={props.row}
            currentTime={props.currentTime}
            onProjectStateChange={props.onProjectStateChange}
            progressCapped={props.progressCapped}
          />
        )
      }
      else{
        content.push(
          <SetProgressAndPauseButton
            key="pause"
            row={props.row}
            currentTime={props.currentTime}
            onPause={props.onProjectStateChange} />
        )
      }
    }
    else{
      content.push(
        <IconButton
          key="start"
          aria-label="Start working on the project"
          onClick={props.onProjectStateChange.bind(this, props.row.id, "workingOnIt")}
          color="primary"
        >
          <StartIcon />
        </IconButton>
      )
    }

    if(!props.isMobile){
      content.push(
        <IconButton
          key="done"
          aria-label="Mark the project as done"
          onClick={props.onProjectStateChange.bind(this, props.row.id, "done")}
          color={props.row.state === "workingOnIt" ? "primary" : undefined}>
          <DoneIcon />
        </IconButton>
      )
    }
  }

  return (
    <TableCell className="ChangeProjectStateCell">
      {content.map(el => el)}
    </TableCell>
  )
}
