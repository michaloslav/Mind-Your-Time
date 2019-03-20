import React from 'react'
import MobileInputFields from './MobileInputFields'
import Button from '@material-ui/core/Button'
import withAdd from '../HOCs/withAdd'

const AddProjectView = props => (
  <MobileInputFields
    {...props}
    button={
      <Button
        onClick={() => {props.add(props.close)}}
        color="primary"
        variant="contained"
      >
        Add
      </Button>
    }
  />
)

export default withAdd(AddProjectView)
