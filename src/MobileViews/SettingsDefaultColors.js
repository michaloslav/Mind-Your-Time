import React from 'react'
import ColorPicker from '../ColorPicker'
import BackButton from './BackButton'
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import RemoveIcon from '@material-ui/icons/Remove';
import AddIcon from '@material-ui/icons/Add';
import withDefaultColorsEditing from '../HOCs/withDefaultColorsEditing'

const SettingsDefaultColors = props => (
  <div className="SettingsDefaultColors container">
    <BackButton onClick={() => {props.history.push("/settings/")}} />
    <Table>
      <TableHead>
        <TableRow>
          <TableCell colSpan={2}>
            <Typography variant="h6">
              Default colors:
            </Typography>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {props.settings.defaultColors && props.settings.defaultColors.map((color, i) => (
          <TableRow key={i}>
            <TableCell>
              <ColorPicker
                value={color}
                onChange={props.onDefaultColorChange.bind(this, i)}
                xl
              />
            </TableCell>
            <TableCell>
              <Button
                aria-label="Remove the color"
                className="removeDefaultColor"
                disableRipple={true}
                onClick={props.removeDefaultColor.bind(this, i)}>
                <RemoveIcon />
                Remove
              </Button>
            </TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell colSpan={2}>
            <Grid container justify="space-around">
              <Button
                onClick={props.addDefaultColor}
                variant="outlined"
                color="primary"
              >
                <AddIcon />
                Add
              </Button>
              <Button
                onClick={() => {props.save(); props.history.push("/settings/")}}
                variant="outlined"
                color="primary"
              >
                Save
              </Button>
            </Grid>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
)

export default withDefaultColorsEditing(SettingsDefaultColors)
