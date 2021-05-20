import React from 'react'
import ReactDOM from 'react-dom'
import { Auth0Provider } from '@auth0/auth0-react'

import Main from './src/Main'
import "./src/styles/index.scss"

ReactDOM.render(
    <Auth0Provider
      domain="vocafeuvre.au.auth0.com"
      clientId="fkfbOAZYrBSRCBnBDFjohQWERE4CP2UB"
      redirectUri={window.location.origin}
    >
        <Main />
    </Auth0Provider>, 
    document.getElementById('root')
)