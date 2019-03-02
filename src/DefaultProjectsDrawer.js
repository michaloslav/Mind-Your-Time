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
import Switch from '@material-ui/core/Switch';

export default function DefaultProjectsDrawer(props){
  return (
    <React.Fragment>
      <Grid container justify="space-between">
        <Grid>
          <Typography variant="h6">Repetitive projects:</Typography>
        </Grid>
        <Grid>
          <label>
            Use repetitive projects
            <Switch
              color="primary"
              checked={props.useDefaultProjects && props.useDefaultProjects !== "false" /*handle string input*/}
              onChange={props.onUseDefaultProjectsChange}
              aria-label="Use default projects"
            />
          </label>
        </Grid>
      </Grid>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell/>
            <TableCell>Name</TableCell>
            <TableCell>Duration</TableCell>
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
                      <TableCell colSpan={2}>
                        You haven't set any repetitive projects yet
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
                          dontShowTime={true}
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
                    dontShowTime={true}
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
