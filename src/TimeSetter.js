import React from 'react';
import LoadingFallback from './LoadingFallback'
import { SettingsContext, IsMobileContext } from './_Context'
import './css/TimeSetter.css'
const TimeSetterDesktop = React.lazy(() => import('./TimeSetterDesktop'))
const TimeSetterMobile = React.lazy(() => import('./TimeSetterMobile'))

// just a wrapper-ish that decides whether we should display the mobile or the desktop version
const TimeSetter = props => (
  <SettingsContext.Consumer>
    {settings => (
      <IsMobileContext.Consumer>
        {isMobile => (
          <React.Suspense fallback={<LoadingFallback/>}>
            {isMobile ? (
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
            )}
          </React.Suspense>
        )}
      </IsMobileContext.Consumer>
    )}
  </SettingsContext.Consumer>
)

export default TimeSetter
