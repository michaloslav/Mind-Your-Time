import 'core-js'; // polyfill
import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import ErrorBoundary from './ErrorBoundary'
import DataSync from './DataSync';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <ErrorBoundary>
    <DataSync />
  </ErrorBoundary>
    , document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();
