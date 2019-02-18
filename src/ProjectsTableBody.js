import React from 'react';
import { Draggable } from 'react-beautiful-dnd'
import ProjectsTableRow from './ProjectsTableRow'
import AddProjectRow from './AddProjectRow'
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import RootRef from '@material-ui/core/RootRef';

export default function ProjectsTableBody(props) {
  return (
    <RootRef rootRef={props.provided.innerRef}>
      <TableBody {...props.provided.droppableProps}>
        {!props.projects.length && (
          <TableRow>
            <TableCell/>
            <TableCell colSpan={3}>
              You haven't set any projects yet
            </TableCell>
            <TableCell/>
          </TableRow>
        )}
        {props.projects.map((row, i) => {
          return (
            <Draggable key={row.id} draggableId={row.id.toString()} index={i}>
              {provided => {
                return (
                  <ProjectsTableRow
                    mode={props.mode}
                    row={row}
                    currentTime={props.currentTime}
                    provided={provided}
                    onColorChange={props.onColorChange}
                    onDoneEditing={props.onDoneEditing}
                    onProjectStateChange={props.onProjectStateChange}
                    onDeleteProject={props.onDeleteProject}
                  />
                )
              }}
            </Draggable>
          )
        })}
        {props.provided.placeholder}
        {
          // if in planning mode..
          props.mode === "planning" && (
            <AddProjectRow
              settings={props.settings}
              defaultColorIndex={props.defaultColorIndex}
              showErrors={props.showErrors}
              lastProject={props.projects[props.projects.length - 1]}
              onAddProject={props.onAddProject}
            />
          )
        }
        </TableBody>
      </RootRef>
  )
}
