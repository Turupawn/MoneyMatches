import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Host from './Host';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter as Router, Route } from "react-router-dom";

import {ThemeProvider} from 'styled-components'
import {theme} from 'rimble-ui'
import Header from "./components/Header";

function AppRouter() {
  return (
    <ThemeProvider theme={theme}>
      <div>
        <Header/>
        <Router>
          <div>
            <Route path="/host/" component={Host} />
            <Route path="/money_match/:money_match_id?" component={App} />
            <Route path="/" exact component={App} />
          </div>
        </Router>
      </div>
    </ThemeProvider>
  );
}

//ReactDOM.render(<App />, document.getElementById('root'));

ReactDOM.render(
  AppRouter(),
  document.getElementById('root')
  );

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
