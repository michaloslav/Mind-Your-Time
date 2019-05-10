import React, { Component } from 'react';
import SetProgressPopoverContent from './SetProgressPopoverContent'
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import PauseIcon from '@material-ui/icons/Pause';
import DoneIcon from '@material-ui/icons/Done';
import './css/ChangeProjectStateDropdown.css'

// used in the mobile version of the UI if the project's state is workingOnIt
// gives the user the option to pause or mark the project as done
export default class ChangeProjectStateDropdown extends Component{
  constructor(props){
    super(props)
    this.state = {
      anchorEl: null,
      showSetProgress: false
    }
  }

  open = e => {
    this.setState({anchorEl: e.currentTarget})
  }

  close = () => {
    this.setState({anchorEl: null})
    setTimeout(() => {
      this.setState({showSetProgress: false}) // hide the setProgress Popover
    }, 500)
  }

  render = () => {
    let {anchorEl} = this.state

    // determines which action should be recommended (by coloring it with the primary color)
    let suggestDone = this.props.progressCapped === this.props.row.estimatedDuration

    return (
      <React.Fragment>
        <IconButton
          aria-label="Open the project state dropdown"
          onClick={this.open}
          color="primary"
        >
          {suggestDone ? <DoneIcon color="primary" /> : <PauseIcon color="primary" />}
        </IconButton>
        <Popover
          className="ChangeProjectStateDropdownMenu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.close}
        >
          {
            this.state.showSetProgress ? (
              <SetProgressPopoverContent
                onPause={this.props.onProjectStateChange}
                row={this.props.row}
                currentTime={this.props.currentTime}
              />
            ) : (
              <List>
                {
                  [
                    {
                      title: "Pause",
                      icon: <PauseIcon color={suggestDone ? undefined : "primary"} />,
                      onClick: this.setState.bind(this, {showSetProgress: true}, null),
                    },
                    {
                      title: "Done",
                      icon: <DoneIcon color={suggestDone ? "primary" : undefined} />,
                      onClick: this.props.onProjectStateChange.bind(this, this.props.row.id, "done"),
                    }
                  ].map(el => (
                    <ListItem key={el.title} button onClick={el.onClick}>
                      {el.icon}
                      {el.title}
                    </ListItem>
                  ))
                }
              </List>
            )
          }
        </Popover>
      </React.Fragment>
    )
  }
}
