import React, { useEffect, useState } from "react";
import { HashRouter as Router, Switch, Route, Link } from "react-router-dom";
import { connect } from "react-redux";
import logo from "./logo.svg";
import { Counter } from "./features/counter/Counter";
import { Chat } from "./features/chat/Chat";
import { Home } from "./features/home/Home";
import { Crypto } from "./features/crypto/Crypto";
import { orbitInstance } from "./app/orbit";
import "./App.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { orbit: {} };
  }

  async componentDidMount() {
    const orbitConnector = await orbitInstance();
    this.setState({ orbit: orbitConnector });
  }

  render() {
    return (
      <div className="App">
        <Router>
          <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
              <a className="navbar-brand" href="#">
                OrbitChat
              </a>
              <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav">
                  <li className="nav-item active">
                    <Link to="/" className="nav-link">
                      Home
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/chat" className="nav-link">
                      chat
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/counter" className="nav-link">
                      counter
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/crypto" className="nav-link">
                      crypto
                    </Link>
                  </li>
                </ul>
              </div>
              <span className="navbar-text username">
                {this.props.username}
              </span>
            </nav>

            {/* A <Switch> looks through its children <Route>s and
                renders the first one that matches the current URL. */}
            <Switch>
              <Route path="/chat">
                <Chat orbit={this.state.orbit} />
              </Route>
              <Route path="/counter">
                <Counter />
              </Route>
              <Route path="/crypto">
                <Crypto />
              </Route>
              <Route path="/">
                <Home orbit={this.state.orbit} />
              </Route>
            </Switch>
          </div>
        </Router>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  username: state.home.username,
});
const mapDispatchToProps = () => {
  return {
    // increment, decrement
  };
};
// export default App;
export default connect(mapStateToProps, mapDispatchToProps())(App);
