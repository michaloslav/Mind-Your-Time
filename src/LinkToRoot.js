import React from 'react';
import { Link } from "react-router-dom";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

export default function LinkToRoot(props){
  return (
    <Link className="LinkToRoot" to="/" aria-label="Back">
      <ArrowBackIcon />
    </Link>
  )
}
