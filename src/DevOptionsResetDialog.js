import React, { Component } from 'react';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import { defaultDataValues } from './util/defaultValues'

// a part of DevOptions, lets the user easily reset local data (especially on mobile devices)
export default class DevOptionsResetDialog extends Component{
  constructor(props){
    super(props)

    // the state here is an object with keys representing the data items and boolean values
    let state = {}
    for(let el of this.props.dataItems) state[el] = true
    this.state = state
  }

  handleChange = id => e => this.setState({[id]: e.target.checked})

  // when the user confirms the reset
  reset = () => {
    let updateData = {}
    for(let el of Object.keys(this.state)) if(this.state[el]){
      updateData[el] = defaultDataValues[el]
    }
    this.props.update(updateData)
    window.location.reload() // reload so that everything can be re-processed properly
  }

  render = () => (
    <React.Fragment>
      <DialogTitle children="Reset local data" />
      <DialogContent>
        <FormGroup>
          {this.props.dataItems.map(el => (
            <FormControlLabel
              key={el}
              control={
                <Checkbox
                  checked={this.state[el]}
                  onChange={this.handleChange(el)}
                />
              }
              label={el}
            />
          ))}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={this.reset} children="Reset" color="primary" />
      </DialogActions>
    </React.Fragment>
  )
}
