import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Admin from './Admin';
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
              <a href="/admin">Admin</a>
            </li>
          </ul>
        </nav>

        <Route path="/" exact component={App} />
        <Route path="/admin/" component={Admin} />
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
