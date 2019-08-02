import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Host from './Host';
import Player from './Player';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

function AppRouter() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/host">Host</a>
            </li>
            <li>
              <a href="/player">Player</a>
            </li>
          </ul>
        </nav>

        <Route path="/" exact component={App} />
        <Route path="/host/" component={Host} />
        <Route path="/player/" component={Player} />
      </div>
    </Router>
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
