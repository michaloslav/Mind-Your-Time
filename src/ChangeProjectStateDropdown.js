import React, { Component } from 'react';
import SetProgressPopoverContent from './SetProgressPopoverContent'
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import MenuIcon from '@material-ui/icons/Menu';
import PauseIcon from '@material-ui/icons/Pause';
import DoneIcon from '@material-ui/icons/Done';
import './css/ChangeProjectStateDropdown.css'

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
      this.setState({showSetProgress: false})
    }, 500)
  }

  render = () => {
    let {anchorEl} = this.state

    return (
      <React.Fragment>
        <IconButton
          aria-label="Open the project state dropdown"
          onClick={this.open}
          color="primary">
          <MenuIcon />
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
                      icon: <PauseIcon/>,
                      onClick: this.setState.bind(this, {showSetProgress: true}, null),
                    },
                    {
                      title: "Done",
                      icon: <DoneIcon color="primary" />,
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
