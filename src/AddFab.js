import React from 'react'
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import './css/AddFab.css'

const AddFab = props => (
  <Fab
    onClick={props.onClick}
    color="primary"
    className="AddFab"
    aria-label="Add a project"
  >
    <AddIcon />
  </Fab>
)

export default AddFab
