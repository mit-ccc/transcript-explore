import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { RouterToUrlQuery } from 'react-url-query';

import MainPage from './pages/MainPage';

// import './App.css';

class App extends Component {
  render() {
    return (
      <Router>
        <RouterToUrlQuery>
          <div className="App">
            <Switch>
              <Route path="/" component={MainPage} />
            </Switch>
          </div>
        </RouterToUrlQuery>
      </Router>
    );
  }
}

export default App;
