import React from 'react';
import SetProgressAndPauseButton from './SetProgressAndPauseButton'
import ChangeProjectStateDropdown from './ChangeProjectStateDropdown'
import TableCell from '@material-ui/core/TableCell';
import IconButton from '@material-ui/core/IconButton';
import DoneIcon from '@material-ui/icons/Done';
import StartIcon from '@material-ui/icons/PlayArrow';
import UndoIcon from '@material-ui/icons/Undo';
import './css/ChangeProjectStateCell.css'

export default function ChangeProjectStateCell(props){
  let content = []
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
    if(props.row.state === "workingOnIt"){
      if(props.isMobile){
        content.push(
          <ChangeProjectStateDropdown
            key="dropdown"
            row={props.row}
            currentTime={props.currentTime}
            onProjectStateChange={props.onProjectStateChange}
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
