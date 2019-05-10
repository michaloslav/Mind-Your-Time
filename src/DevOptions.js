import React, { Component } from 'react';
import DevOptionsResetDialog from './DevOptionsResetDialog';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Dialog from '@material-ui/core/Dialog';
import DeveloperModeIcon from '@material-ui/icons/DeveloperMode';

// used mainly for exporting/importing local data
// is made available by going to Settings and clicking the icon next to the "General" section label several times in a row
export default class DevOptions extends Component{
  constructor(props){
    super(props)
    this.state = {
      anchorEl: null, // the bulk of the element is a Menu, thus the need for an anchor
      resetDialogOpen: false
    }
  }

  open = e => this.setState({anchorEl: e.currentTarget})

  close = () => {
    this.setState({anchorEl: null})
    if(this.props.close) this.props.close()
  }

  // exports an object with a date and the data
  export = () => {
    let date = new Date()

    // create a file with the data
    let file = new Blob([
      JSON.stringify({data: this.props.data, date: date.toLocaleString()})
    ], {type: "application/json"})

    let filename = "Mind-Your-Time-data-" + date.toISOString()
    filename = filename.replace(".", "-")

    // IE
    if(window.navigator.msSaveOrOpenBlob) window.navigator.msSaveOrOpenBlob(file, filename)

    else{
      // trigger a download
      let a = document.createElement("a")
      let url = URL.createObjectURL(file)
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      })
    }
  }

  import = () => {
    // create the element to trigger the upload
    let input = document.createElement("input")
    input.type = "file"
    input.style = "display: none;"
    input.accept = ".json"

    // when the user uploads a file, load it using FileReader
    input.addEventListener("change", e => {
      let file = e.path[0].files[0]
      let fileReader = new FileReader()
      fileReader.onloadend = () => {
        // ask the user to confirm that they want to load the data first
        let {data, date} = JSON.parse(fileReader.result)
        if(window.confirm("Are you sure you want to load data from " + date + "? This will permanently delete all your current local data.")){
          this.props.update(data)
        }
      }
      fileReader.readAsText(file)
    })

    // trigger the upload
    document.body.appendChild(input)
    input.click()
    setTimeout(() => {
      document.body.removeChild(input)
    })
  }

  render = () => (
    <React.Fragment>
      {this.props.showAsListItem ? (
        <ListItem button onClick={this.open}>
          <ListItemIcon children={<DeveloperModeIcon />} />
          <ListItemText children="Stuff for nerds" />
        </ListItem>
      ) : (
        <MenuItem onClick={this.open}>
          <DeveloperModeIcon />
          Stuff for nerds
        </MenuItem>
      )}
      <Menu
        anchorEl={this.state.anchorEl}
        open={Boolean(this.state.anchorEl)}
        onClose={this.close}
      >
        <MenuItem onClick={this.export}>
          Export
        </MenuItem>
        <MenuItem onClick={this.import}>
          Import
        </MenuItem>
        <MenuItem onClick={() => this.setState({resetDialogOpen: true})}>
          Reset
        </MenuItem>
        <Dialog
          open={this.state.resetDialogOpen}
          onClose={() => this.setState({resetDialogOpen: false})}
        >
          <DevOptionsResetDialog
            dataItems={Object.keys(this.props.data).sort()}
            update={this.props.update}
          />
        </Dialog>
      </Menu>
    </React.Fragment>
  )
}
