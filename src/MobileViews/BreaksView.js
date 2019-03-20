import React from 'react'
import BackButton from './BackButton'
import AddFab from '../AddFab'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import TimeCalc from '../util/TimeCalc'
import { SettingsContext } from '../_Context'
import '../css/BreaksView.css'

const BreaksView = props => (
  <Grid className="BreaksView container">
    <BackButton onClick={props.changeView.bind(this, "breaks", false)} />
    <Typography variant="h6" className="title">
      Breaks
    </Typography>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Time</TableCell>
          <TableCell/>
        </TableRow>
      </TableHead>
      <TableBody>
        {props.breaks.length ? (
          props.breaks.map(breakInfo => (
            <TableRow key={breakInfo.id}>
              <TableCell>
                {breakInfo.name}
              </TableCell>
              <TableCell>
                <SettingsContext.Consumer>
                  {settings => (
                    TimeCalc.makeString(
                      breakInfo.startTime,
                      breakInfo.startTime.pm !== breakInfo.endTime.pm,
                      true,
                      settings.timeFormat24H
                    ) + "-" + TimeCalc.makeString(
                      breakInfo.endTime,
                      true,
                      true,
                      settings.timeFormat24H
                    )
                  )}
                </SettingsContext.Consumer>
              </TableCell>
              <TableCell>
                <IconButton onClick={props.changeView.bind(this, "edit", true, {type: "break", id: breakInfo.id})}>
                  <EditIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4}>You haven't set any breaks</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
    <AddFab onClick={props.changeView.bind(this, "add", true, {type: "break"})} />
  </Grid>
)

export default BreaksView
