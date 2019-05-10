import React, { Component } from 'react';
import ColorPicker from './ColorPicker'
import ProjectsTableRowEditing from './ProjectsTableRowEditing'
import ProjectsTableRowDisplay from './ProjectsTableRowDisplay'
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import RootRef from '@material-ui/core/RootRef';
import Icon from '@material-ui/core/Icon';
import TimeCalc from './util/TimeCalc'
import './css/ProjectsTableRow.css'

// used both for diplaying and editing projects (at least in the desktop version)
// used both for projects and defaultProject
// update: this component is now only a "wrapper" ish that reders either ProjectsTableRowDisplay or ProjectsTableRowEditing
// it also handles the functionality that these two have in common to DRY the code
export default class ProjectsTableRow extends Component {
  constructor(props){
    super(props)
    this.state = {editing: false}
  }

  render(){
    // are we currently editing or just showing data?
    // also, don't show the editing UI if we're in "working" mode
    let showEditing = this.state.editing && this.props.mode === "planning"

    let {isDefaultProjects} = this.props

    let progress, progressCapped, tableRowStyle = {}
    if(!isDefaultProjects){
      // calculate progress
      if(this.props.row.progress) progress = parseInt(this.props.row.progress)
      else progress = 0
      if(this.props.row.state === "workingOnIt"){
        progress += TimeCalc.subtractToMinutes(
          {...this.props.currentTime, s: new Date().getSeconds()},
          this.props.row.startedWorkingOnIt,
          true
        )
      }

      progressCapped = progress // same as progress except capped at estimatedDuration
      if(progressCapped > this.props.row.estimatedDuration) progressCapped = this.props.row.estimatedDuration

      let percentageDone

      if(this.props.row.state === "done") percentageDone = 100
      else percentageDone = 100 * progressCapped / this.props.row.estimatedDuration

      // fills the background of the row with green color, the size of which corresponds to progress as a fraction of duration
      tableRowStyle = {
        backgroundImage: `linear-gradient(to right, #00c8002e, #00c8002e ${percentageDone}%, transparent ${percentageDone}%, transparent 100%)`
      }
    }

    // get the props that should be passed down
    let passThroughProps
    if(showEditing){
      let {row, settings} = this.props
      let {id} = row

      let {name, estimatedDuration, color} = row
      let inputValues = {name, duration: estimatedDuration, color}

      let deleteFunc = this.props.onDeleteProject.bind(this, id)
      let onDoneEditing = this.props.onDoneEditing.bind(this, id)

      let type
      if(isDefaultProjects){
        type = "default"
        inputValues.days = row.days
      }
      else{
        inputValues.startTime = row.plannedTime.start
      }

      passThroughProps = {settings, inputValues, delete: deleteFunc, onDoneEditing, type, id}
    }
    else{
      let {
        row, mode, isDefaultProjects, settings, currentTime,
        startEditingMobile, onDeleteProject, onProjectStateChange
      } = this.props
      passThroughProps = {
        row, mode, isDefaultProjects, settings, currentTime,
        startEditingMobile, onDeleteProject, onProjectStateChange
      }
    }

    return (
      <RootRef rootRef={this.props.provided.innerRef}>
        <TableRow
          {...this.props.provided.draggableProps}
          style={/* merging the two style objects */{
            ...this.props.provided.draggableProps.style,
            ...tableRowStyle
          }}
        >
          <TableCell>
            <Icon className="dragIcon" {...this.props.provided.dragHandleProps}>drag_indicator</Icon>
            <ColorPicker value={this.props.row.color} onChange={this.props.onColorChange.bind(this, this.props.row.id)}/>
          </TableCell>

          {showEditing ? (
            <ProjectsTableRowEditing
              close={() => this.setState({editing: false})}
              {...passThroughProps}
            />
          ) : (
            <ProjectsTableRowDisplay
              progress={progress}
              progressCapped={progressCapped}
              startEditing={() => this.setState({editing: true})}
              {...passThroughProps}
            />
          )}
        </TableRow>
      </RootRef>
    )
  }
}
