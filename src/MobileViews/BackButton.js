import React from 'react'
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import '../css/BackButton.css'

const BackButton = props => (
  <IconButton onClick={props.onClick} className="BackButton" aria-label="Back">
    <ArrowBackIcon />
  </IconButton>
)

export default BackButton
