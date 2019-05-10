import React from 'react';
import { Link } from "react-router-dom";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

// a simple arrow acon that takes us back to "/"
const LinkToRoot = props => (
  <Link className="LinkToRoot" to="/" aria-label="Back">
    <ArrowBackIcon />
  </Link>
)

export default LinkToRoot
