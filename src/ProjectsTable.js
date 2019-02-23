import React from 'react';
import ProjectsTableBody from './ProjectsTableBody'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';


export default function ProjectsTable(props){
  return (
    <Table id="ProjectsTable">
      <TableHead>
        <TableRow>
          <TableCell/>
          <TableCell>Name</TableCell>
          <TableCell>Duration estimate</TableCell>
          <TableCell>Planned time</TableCell>
          <TableCell/>
        </TableRow>
      </TableHead>
      <DragDropContext onDragEnd={props.onDragEnd}>
        <Droppable droppableId="0">
          {provided => (
              <ProjectsTableBody
                projects={props.projects}
                mode={props.mode}
                settings={props.settings}
                currentTime={props.currentTime}
                defaultColorIndex={props.defaultColorIndex}
                showErrors={props.showErrors}
                onColorChange={props.onColorChange}
                onDoneEditing={props.onDoneEditing}
                onAddProject={props.onAddProject}
                provided={provided}
                onProjectStateChange={props.onProjectStateChange}
                onDeleteProject={props.onDeleteProject} />
              )
            }
          </Droppable>
        </DragDropContext>
    </Table>
  )
}
