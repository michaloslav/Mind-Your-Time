import React from 'react'
import MobileInputFields from './MobileInputFields'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete';
import withEdit from '../HOCs/withEdit'

const EditProjectView = props => (
  <MobileInputFields
    {...props}
    button={
      <Button
        onClick={(id, values) => {props.save(id, values); props.close();}}
        color="primary"
        variant="contained"
      >
        Save
      </Button>
    }
    buttonTop={
      <IconButton
        onClick={() => {
          if(window.confirm("Are you sure you want to delete this?")){
            props.close(); props.delete();
          }
        }}
      >
        <DeleteIcon />
      </IconButton>
    }
    title={
      props.type && (
        "Edit the " +
        (props.type === "break" ? "break" : (props.type === "default" && "repetitive project"))
      )
    }
  />
)

export default withEdit(EditProjectView)
