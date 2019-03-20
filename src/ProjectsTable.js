import React from 'react';
import ProjectsTableRow from './ProjectsTableRow'
import AddProjectRow from './AddProjectRow'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import RootRef from '@material-ui/core/RootRef';
import { IsMobileContext } from './_Context'
import './css/ProjectsTable.css'

const ProjectsTable = props => (
  <IsMobileContext.Consumer>
    {isMobile => (
      <Table id="ProjectsTable"  className="projectsTable">
        <TableHead>
          <TableRow>
            <TableCell/>
            <TableCell>Name</TableCell>
            {!isMobile && <TableCell>Duration estimate</TableCell>}
            <TableCell>{isMobile ? "Time" : "Planned time"}</TableCell>
            <TableCell/>
          </TableRow>
        </TableHead>
        <DragDropContext onDragEnd={props.onDragEnd}>
          <Droppable droppableId="0">
            {provided => (
              <RootRef rootRef={provided.innerRef}>
                <TableBody {...provided.droppableProps}>
                  {!props.projects.length && (
                    <TableRow>
                      <TableCell/>
                      <TableCell
                        colSpan={isMobile ? 2 : 3}
                        style={props.showErrors.noProjects ? {
                          color: "red",
                          fontWeight: 500
                        } : null}
                      >
                        You haven't set any projects yet
                      </TableCell>
                      <TableCell/>
                    </TableRow>
                  )}
                  {props.projects.map((row, i) => (
                    <Draggable key={row.id} draggableId={row.id.toString()} index={i}>
                      {provided => (
                        <ProjectsTableRow
                          mode={props.mode}
                          row={row}
                          currentTime={props.currentTime}
                          provided={provided}
                          onColorChange={props.onColorChange}
                          onDoneEditing={props.onDoneEditing}
                          onProjectStateChange={props.onProjectStateChange}
                          onDeleteProject={props.onDeleteProject}
                          startEditingMobile={props.startEditingMobile}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {
                    // if in planning mode..
                    props.mode === "planning" && !isMobile && (
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
            )}
          </Droppable>
        </DragDropContext>
      </Table>
    )}
  </IsMobileContext.Consumer>
)

export default ProjectsTable
