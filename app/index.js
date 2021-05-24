import React from 'react'
import ReactDOM from 'react-dom'
import { Auth0Provider } from '@auth0/auth0-react'
import { BrowserRouter } from 'react-router-dom'

import Main from './src/Main'

import "./src/styles/index.scss"
import "./src/styles/kendo-components.scss"

import settings from '../web-settings.json'

import createApiClient from './src/clients/api'

const apiClient = createApiClient(settings)

ReactDOM.render(
    <Auth0Provider
      domain={settings.auth0_domain}
      clientId={settings.auth0_client_id}
      redirectUri={window.location.origin}
      audience={settings.auth0_aud_url}
      scope="read:current_user update:current_user_metadata"
    >
      <BrowserRouter>
        <Main apiClient={apiClient} />
      </BrowserRouter>
    </Auth0Provider>, 
    document.getElementById('root')
)