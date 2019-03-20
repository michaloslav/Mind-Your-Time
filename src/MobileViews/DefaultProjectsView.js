import React from 'react'
import BackButton from './BackButton'
import DefaultProjectsDrawer from '../DefaultProjectsDrawer'
import AddFab from '../AddFab'
import Grid from '@material-ui/core/Grid';

const DefaultProjectsView = props => {
  let { changeView, ...passThoughProps } = props

  return (
    <Grid className="DefaultProjectsView container">
      <BackButton onClick={changeView.bind(this, "defaultProjects", false)} />
      <DefaultProjectsDrawer {...passThoughProps} mobile />
      <AddFab onClick={changeView.bind(this, "add", true, {type: "default"})} />
    </Grid>
  )
}

export default DefaultProjectsView
