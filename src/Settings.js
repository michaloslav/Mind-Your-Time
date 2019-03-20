import React, { Component } from 'react';
import ColorPicker from './ColorPicker'
import Input from '@material-ui/core/Input';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon'
import { Link } from "react-router-dom";
import { IsMobileContext } from './_Context'
import withDefaultColorsEditing from './HOCs/withDefaultColorsEditing'
import './css/Settings.css'

const sectionInfo = {
  general: {
    order: 0,
    label: "General settings",
    icon: "settings"
  },
  detection: {
    order: 1,
    label: "Automatic detection",
    icon: "search"
  },
  misc: {
    order: 2,
    label: "Miscellaneous",
    icon: "menu"
  },
}

const inputInfo = {
  timeFormat24H: {
    label: "Use the 24-hour time format",
    type: "boolean",
    section: "general",
    order: 0,
    icon: "timer"
  },
  bufferTimePercentage: {
    label: "Bufffer time percentage",
    type: "percentage",
    max: 1,
    tooltip: "Buffer times are short breaks inserted after each project. Their length depends on the length of the project before them. This field determines what percentage of the previous project's duration the buffer will be.",
    section: "general",
    order: 1,
    icon: "view_week"
  },
  showResetButtonAfter: {
    label: "Show reset button after (hours)",
    type: "int",
    section: "misc",
    order: 3,
    icon: "restore"
  },
  defaultColors: {
    label: "Default colors:",
    type: "colors",
    section: "misc",
    order: 0,
    icon: "invert_colors"
  },
  updateTimesAfterDrag: {
    label: "Adjust planned times after changing the order of projects",
    type: "boolean",
    section: "detection",
    order: 0,
    icon: "swap_vert"
  },
  updateTimesAfterEdit: {
    label: "Adjust planned times after editing a project",
    type: "boolean",
    section: "detection",
    order: 1,
    icon: "edit"
  },
  updateTimesAfterDelete: {
    label: "Adjust planned times after deleting a project",
    type: "boolean",
    section: "detection",
    order: 2,
    icon: "delete"
  },
  roundTo: {
    label: "Round to (minutes)",
    type: "int",
    section: "misc",
    order: 2,
    icon: "access_time"
  },
  changeModeOnTab: {
    label: "Change mode when the Tab key is pressed",
    type: "boolean",
    section: "misc",
    order: 1,
    icon: "redo"
  },
  detectBreaksAutomatically: {
    label: "Detect breaks automatically",
    type: "boolean",
    section: "detection",
    order: 3,
    icon: "pause"
  }
}

class Settings extends Component{
  constructor(props){
    super(props)
    this.state = {
      inputs: this.props.settings,
      showErrors: {}
    }
  }

  componentDidUpdate(){
    // only update if it's the init with data from localStorage
    if(!Object.keys(this.state.inputs).length && this.props.settings){
      this.setState({inputs: this.props.settings})
    }
  }

  handleInputChange(id, e){
    let val = inputInfo[id].type === "boolean" ? e.target.checked : e.target.value

    // validation
    switch (inputInfo[id].type) {
      case "int":
        if(isNaN(val) && val !== "") return
        break;
      case "percentage":
        let percentage = val.split("%")[0]
        if(percentage !== "") val = percentage / 100
        if(isNaN(val) && val !== "%") return // if NaN, empty or last character is . (eg. 0.)
        break;
      default:
    }
    if(typeof inputInfo[id].max !== "undefined" && val > inputInfo[id].max) return

    let newState = {inputs: this.state.inputs, showErrors: this.state.showErrors}
    newState.inputs[id] = val
    newState.showErrors[id] = false
    this.setState({newState})
  }

  save = () => {
    // validation (for empty percentage)
    let inputs = this.state.inputs
    let keys = Object.keys(inputs)
    for(let i = 0; i < keys.length; i++){
      if(inputInfo[keys[i]] && inputInfo[keys[i]].type === "percentage" && inputs[keys[i]] === "%"){
        let showErrors = this.state.showErrors
        showErrors[keys[i]] = true
        this.setState({showErrors})
        return
      }
    }

    this.props.update({settings: inputs})
    this.props.history.push("/")
  }

  resetToDefault = () => {
    if(window.confirm("Are you sure you want to reset your settings back to default?")){
      this.setState({inputs: this.props.defaultSettings})
      this.props.update({settings: this.props.defaultSettings})
    }
  }

  render(){
    let inputKeysSorted = Object.keys(this.state.inputs).sort((a, b) => {
      let sectionA = inputInfo[a].section
      let sectionB = inputInfo[b].section
      let sectionAOrder = sectionInfo[sectionA].order
      let sectionBOrder = sectionInfo[sectionB].order

      // if each is in a different section, sort by that
      if(sectionAOrder !== sectionBOrder) return sectionAOrder > sectionBOrder ? 1 : -1
      // if they're both in the same section, sort by their own order
      else return inputInfo[a].order > inputInfo[b].order ? 1 : -1
    })

    let inputs = inputKeysSorted.map((el, i) => {
      let tableRow

      if(el === "defaultColors") tableRow = (
        <TableRow key={i}>
          <TableCell className="iconCell">
            <Icon>{inputInfo[el].icon}</Icon>
          </TableCell>
          <TableCell>
            Default colors:
          </TableCell>
          <IsMobileContext.Consumer>
            {isMobile => (
              isMobile ? (
                <TableCell className="value">
                  <Link to="/settings/defaultColors" aria-label="Set default colors">
                    <Button variant="outlined">
                      Set
                    </Button>
                  </Link>
                </TableCell>
              ) : (
                <TableCell id="defaultColorsCell" className="value">
                  {
                    this.state.inputs.defaultColors.map((color, i) => (
                      <div key={i}>
                        <ColorPicker
                          value={color}
                          onChange={this.props.onDefaultColorChange.bind(this, i)}
                        />
                        <div className="removeDefaultColorDiv">
                          <IconButton
                            aria-label="Remove the color"
                            className="removeDefaultColor"
                            disableRipple={true}
                            onClick={this.props.removeDefaultColor.bind(this, i)}>
                            <Icon>remove</Icon>
                          </IconButton>
                        </div>
                      </div>
                    ))
                  }
                  <IconButton
                    id="addDefaultColor"
                    aria-label="Add a new default color"
                    onClick={this.props.addDefaultColor}>
                    <Icon>add</Icon>
                  </IconButton>
                </TableCell>
              )
            )}
          </IsMobileContext.Consumer>
          <TableCell className="rightCell" />
        </TableRow>
      )
      else{
        // handle undefined inputInfo
        if(!inputInfo[el]){
          console.warn(el + "is not a property of inputInfo");
          return <div />
        }
        tableRow =  (
          <TableRow key={i}>
            <TableCell className="iconCell">
              <Icon>{inputInfo[el].icon}</Icon>
            </TableCell>
            <TableCell>
              {inputInfo[el].label}
              {inputInfo[el].tooltip && (
                <Tooltip title={inputInfo[el].tooltip} disableFocusListener disableTouchListener>
                  <Icon className="tooltipIcon">help</Icon>
                </Tooltip>
              )}
              :
            </TableCell>
            <TableCell className="value">
              {
                inputInfo[el].type === "boolean" ? (
                  <Switch
                    color="primary"
                    checked={this.state.inputs[el]}
                    onChange={this.handleInputChange.bind(this, el)}
                    aria-label={inputInfo[el].label}
                  />
                ) : (
                  <Input
                    value={
                      (inputInfo[el].type === "percentage" && this.state.inputs[el] !== "%") ? (
                        this.state.inputs[el] * 100 + "%"
                      ) : (this.state.inputs[el])
                    }
                    onChange={this.handleInputChange.bind(this, el)}
                    error={this.state.showErrors[el]}
                    aria-label={inputInfo[el].label}
                  />
                )
              }
            </TableCell>
            <TableCell className="rightCell" />
          </TableRow>
        )
      }

      // if this and the previous element are in the same section, return
      if(i && inputInfo[el].section === inputInfo[inputKeysSorted[i-1]].section) return tableRow
      // if they're each in a different section
      else return (
        <React.Fragment key={i}>
          <TableRow>
            <TableCell className="sectionIconCell">
              <Icon>{sectionInfo[inputInfo[el].section].icon}</Icon>
            </TableCell>
            <TableCell colSpan={3}>
              <Typography variant="h5" style={{paddingTop: "2.5rem"}}>
                {sectionInfo[inputInfo[el].section].label}:
              </Typography>
            </TableCell>
          </TableRow>
          {tableRow}
        </React.Fragment>
      )
    })

    return (
      <div className="Settings container">
        <Table>
          <TableBody>
            {inputs.map(input => input)}
            <TableRow>
              <TableCell colSpan={4}>
                <Grid
                  container
                  alignItems='baseline'
                  justify="space-around"
                >
                  <Grid>
                    <Button
                      onClick={this.save}
                      variant="contained"
                      color="primary">
                      Save
                    </Button>
                  </Grid>
                  <Grid>
                    <Button
                      onClick={this.resetToDefault}
                      variant="contained">
                      Reset to default
                    </Button>
                  </Grid>
                </Grid>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )
  }
}

export default withDefaultColorsEditing(Settings)
