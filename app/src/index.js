import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import store, { history } from './store'
// import { LocaleProvider } from 'antd'
// import enUS from 'antd/lib/locale-provider/en_US'
// import App from './containers/app'
import App from './App'


import './index.css'

const target = document.querySelector('#root')

render(
  <App />,
  target
)