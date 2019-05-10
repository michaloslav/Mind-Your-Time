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
import {sectionInfo, inputInfo} from './util/settingsConfig'


class Settings extends Component{
  constructor(props){
    super(props)
    this.state = {
      inputs: this.props.settings,
      showErrors: {},
      temp: {}
    }
  }

  componentDidUpdate(){
    // only update if it's the init with data from localStorage
    //(which won't be loaded immediately if the user loads /settings directly)
    if(!Object.keys(this.state.inputs).length && this.props.settings){
      this.setState({inputs: this.props.settings})
    }
  }

  componentWillUnmount(){
    // prevent memory leaks
    clearTimeout(this.state.temp.firstSectionIconClickCounterTimeout)
  }

  handleInputChange(id, e){
    // handle checkboxes too
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

    // save to state, hide errors
    let newState = {inputs: this.state.inputs, showErrors: this.state.showErrors}
    newState.inputs[id] = val
    newState.showErrors[id] = false
    this.setState({newState})
  }

  // save and go back
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

  // unlocks dev options (which are unlocked by clicking the icon of the first section several times)
  handleFirstSectionIconClick = () => {
    // count the amount of clicks
    let {firstSectionIconClickCounter} = this.state.temp
    if(!firstSectionIconClickCounter) firstSectionIconClickCounter = 0
    firstSectionIconClickCounter++

    // if there have been enough clicks...
    if(firstSectionIconClickCounter > 12){
      // turn off dev options if they were previously enabled
      if(localStorage.devUnlocked){
        if(window.confirm("Are you sure you want to turn off dev options?")){
          localStorage.removeItem("devUnlocked")
        }
      }

      // if dev options were previously disabled, enable them
      else{
        if(window.confirm(
          `Howdy there! Looks like you just clicked the settings icon 13 times
in a row which means a) you just had a stroke or b) you're trying to unlock developer options.
If it's the former, please seek help immediately. If the latter, click OK.`
        )){
          localStorage.devUnlocked = true

          // clear the timeout to prevent memory leaks, delete the temp values as they are no longer needed
          clearTimeout(this.state.temp.firstSectionIconClickCounterTimeout)
          let temp = this.state.temp
          delete temp.firstSectionIconClickCounter
          delete temp.firstSectionIconClickCounterTimeout

          this.setState({temp})
        }
      }
    }

    // rest the click counter 3 seconds after the last click (always have only 1 timout runing)
    clearTimeout(this.state.temp.firstSectionIconClickCounterTimeout)
    let firstSectionIconClickCounterTimeout = setTimeout(() => {
      this.setState({temp: {...this.state.temp, firstSectionIconClickCounter: 0}})
    }, 3000)

    this.setState({temp: {
      ...this.state.temp,
      firstSectionIconClickCounter,
      firstSectionIconClickCounterTimeout
    }})
  }

  render(){
    // convert the state into a 2D UI array to make rendering easier
    // the 1st dimension represents sections, the 2nd one individual elements
    // eg. [["timeFormat", "autosave"], ["theme"]]
    let inputKeys = []
    let sectionKeys = Object.keys(sectionInfo)
    sectionKeys.sort((a, b) => sectionInfo[a].order > sectionInfo[b].order ? 1 : -1)
    for(let sectionName of sectionKeys){
      let inputsInSection = Object.keys(this.state.inputs).filter(el => inputInfo[el].section === sectionName)
      inputsInSection.sort((a, b) => inputInfo[a].order > inputInfo[b].order ? 1 : -1)
      inputKeys.push(inputsInSection)
    }

    return (
      <div className="Settings container">
        <Table>
          <TableBody>
            {inputKeys.map((inputKeyArray, i) => {
              let sectionName = Object.keys(sectionInfo).find(name => sectionInfo[name].order === i)

              return (
                <React.Fragment key={i}>
                  <TableRow>
                    <TableCell className="sectionIconCell">
                      <Icon onClick={i ? () => {} : this.handleFirstSectionIconClick}>
                        {sectionInfo[sectionName].icon}
                      </Icon>
                    </TableCell>
                    <TableCell colSpan={3}>
                      <Typography variant="h5" style={{paddingTop: "2.5rem"}}>
                        {sectionInfo[sectionName].label}:
                      </Typography>
                    </TableCell>
                  </TableRow>
                  {inputKeyArray.map((inputKey, i) => (
                    inputKey === "defaultColors" ? (
                      <TableRow key={i}>
                        <TableCell className="iconCell">
                          <Icon>{inputInfo[inputKey].icon}</Icon>
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
                    ) : (
                      <TableRow key={i}>
                        <TableCell className="iconCell">
                          <Icon>{inputInfo[inputKey].icon}</Icon>
                        </TableCell>
                        <TableCell>
                          {inputInfo[inputKey].label}
                          {inputInfo[inputKey].tooltip && (
                            <Tooltip title={inputInfo[inputKey].tooltip} disableFocusListener disableTouchListener>
                              <Icon className="tooltipIcon">help</Icon>
                            </Tooltip>
                          )}
                          :
                        </TableCell>
                        <TableCell className="value">
                          {
                            inputInfo[inputKey].type === "boolean" ? (
                              <Switch
                                color="primary"
                                checked={this.state.inputs[inputKey]}
                                onChange={this.handleInputChange.bind(this, inputKey)}
                                aria-label={inputInfo[inputKey].label}
                              />
                            ) : (
                              <Input
                                value={
                                  (inputInfo[inputKey].type === "percentage" && this.state.inputs[inputKey] !== "%") ? (
                                    this.state.inputs[inputKey] * 100 + "%"
                                  ) : (this.state.inputs[inputKey])
                                }
                                onChange={this.handleInputChange.bind(this, inputKey)}
                                error={this.state.showErrors[inputKey]}
                                aria-label={inputInfo[inputKey].label}
                              />
                            )
                          }
                        </TableCell>
                        <TableCell className="rightCell" />
                      </TableRow>
                    )
                  ))}
                </React.Fragment>
              )
            })}
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
