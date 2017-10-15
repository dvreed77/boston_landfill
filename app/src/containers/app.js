import React from 'react';
import { Route, Link } from 'react-router-dom'
import Home from './home'
import About from './about'
import Testing from './autocomplete'
import Page1 from './page1'
import Page2 from './page2'


const App = () => (
  <div>
    <header>
      <Link to="/">Home</Link>
      <Link to="/about-us">About</Link>
    </header>

    <main>
      <Route exact path="/" component={Home} />
      <Route exact path="/about-us" component={About} />
      <Route exact path="/test1" component={Testing} />
      <Route exact path="/page1" component={Page1} />
      <Route exact path="/page2" component={Page2} />
    </main>
  </div>
)

export default App