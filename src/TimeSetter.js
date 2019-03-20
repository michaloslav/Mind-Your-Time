import React from 'react';
import TimeSetterDesktop from './TimeSetterDesktop'
import TimeSetterMobile from './TimeSetterMobile'
import { SettingsContext, IsMobileContext } from './_Context'
import './css/TimeSetter.css'

const TimeSetter = props => (
  <SettingsContext.Consumer>
    {settings => (
      <IsMobileContext.Consumer>
        {isMobile => (
          isMobile ? (
            <TimeSetterMobile
              mode={settings.timeFormat24H ? "24h" : "12h"}
              value={props.value}
              onChange={props.onChange}
              error={
                props.hError ||
                props.mError ||
                props.showErrorProp
              }
            />
          ) : (
            <TimeSetterDesktop
              onChange={props.onChange}
              value={props.value}
              firstInputId={props.firstInputId}
              hError={props.hError}
              mError={props.mError}
              onEnterPress={props.onEnterPress}
              settings={settings}
            />
          )
        )}
      </IsMobileContext.Consumer>
    )}
  </SettingsContext.Consumer>
)

export default TimeSetter
