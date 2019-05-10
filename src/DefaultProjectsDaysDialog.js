import React, { Component } from 'react';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';

// used to let the user decide on which days they want to use each defaultProject
export default class DefaultProjectsDaysDialog extends Component{
  constructor(props){
    super(props)

    // get days from the props, if they arent available, set them all to true (as this is the most common case)
    var days
    if(this.props.project && this.props.project.days) days = this.props.project.days
    else{
      days = []
      for(let i = 0; i < 7; i++) days.push(true)
    }
    this.state = {days}
  }

  handleChange(i, e){
    let {days} = this.state
    days[i] = e.currentTarget.checked
    this.setState({days})
    this.props.save(days)
  }

  render = () => (
    <React.Fragment>
      <DialogTitle id="DefaultProjectsDaysDialogTitle">
        Days{this.props.project.name && " - " + this.props.project.name}
      </DialogTitle>
      <DialogContent>
        <FormGroup>
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, i) => (
            <FormControlLabel
              key={i}
              control={
                <Checkbox
                  checked={this.state.days[i]}
                  onChange={this.handleChange.bind(this, i)}
                />
              }
              label={day}
            />
          ))}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={() => this.props.close()}>
          Save
        </Button>
      </DialogActions>
    </React.Fragment>
  )
}
