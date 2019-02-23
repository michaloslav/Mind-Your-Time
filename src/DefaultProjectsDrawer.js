import React from 'react';
import ProjectsTableRow from './ProjectsTableRow'
import AddProjectRow from './AddProjectRow'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import RootRef from '@material-ui/core/RootRef';
import Typography from '@material-ui/core/Typography';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

export default function DefaultProjectsDrawer(props){
  return (
    <React.Fragment>
      <Typography variant="h6">Default projects:</Typography>
      <Table className="DefaultProjectsDrawer">
        <TableHead>
          <TableRow>
            <TableCell/>
            <TableCell>Name</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Time</TableCell>
            <TableCell/>
          </TableRow>
        </TableHead>
        <DragDropContext onDragEnd={props.onDragEnd}>
          <Droppable droppableId="0">
            {provided =>(
              <RootRef rootRef={provided.innerRef}>
                <TableBody {...provided.droppableProps}>
                  {!props.projects.length && (
                    <TableRow>
                      <TableCell/>
                      <TableCell colSpan={3}>
                        You haven't set any projects yet
                      </TableCell>
                      <TableCell/>
                    </TableRow>
                  )}
                  {props.projects.map((project, i) => (
                    <Draggable key={project.id} draggableId={project.id.toString()} index={i}>
                      {provided2 => (
                        <ProjectsTableRow
                          mode="planning"
                          row={project}
                          currentTime={props.currentTime}
                          provided={provided2}
                          onColorChange={props.onColorChange}
                          onDoneEditing={props.onDoneEditing}
                          onProjectStateChange={props.onProjectStateChange}
                          onDeleteProject={props.onDeleteProject}
                          dontCalculateState={true}
                        />
                      )}
                    </Draggable>
                    ))}
                  {provided.placeholder}
                  <AddProjectRow
                    settings={props.settings}
                    defaultColorIndex={props.defaultColorIndex}
                    showErrors={{}}
                    lastProject={props.projects[props.projects.length - 1]}
                    onAddProject={props.onAddProject}
                  />
                </TableBody>
              </RootRef>
            )}
          </Droppable>
        </DragDropContext>
      </Table>
      <Grid container justify="center">
        <Button
          onClick={props.onClose}
          variant="contained"
          color="primary"
          style={{margin: ".5rem"}}>
          Save
        </Button>
      </Grid>
    </React.Fragment>
  )
}
