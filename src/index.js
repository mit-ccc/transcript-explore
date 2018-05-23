import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { initializeGlobalData } from './globalData';
// import registerServiceWorker from './registerServiceWorker';

// Note: we include .css files even though we write .scss files
// see: https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#adding-a-css-preprocessor-sass-less-etc
import './assets/base.css';

const render = Component => {
  ReactDOM.render(<Component />, document.getElementById('root'));
};

initializeGlobalData().then(() => {
  // Kick off initial render
  render(App);
  // registerServiceWorker();
});

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./components/App', () => {
    const App = require('./components/App').default;
    render(App);
  });
}
