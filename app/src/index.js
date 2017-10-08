import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import store, { history } from './store'
import { LocaleProvider } from 'antd'
import enUS from 'antd/lib/locale-provider/en_US'
import App from './containers/app'

import './index.css'

const target = document.querySelector('#root')

render(
  <Provider store={store}>
    <LocaleProvider locale={enUS}>
    <ConnectedRouter history={history}>
      <div>
        <App />
      </div>
    </ConnectedRouter>
    </LocaleProvider>
  </Provider>,
  target
)