import React from 'react'
import { hot } from 'react-hot-loader'
import { useAuth0 } from '@auth0/auth0-react'

import { Notification, NotificationGroup } from '@progress/kendo-react-notification'
import { Route, Switch } from 'react-router-dom'

import createApiClient from './clients/api'

import AppBar from './main/AppBar'
import DriveFeed from './main/DriveFeed'
import DrivePage from './main/DrivePage'
import DriveOrganizer from './main/DriveOrganizer'
import DriveCreation from './main/DriveCreation'
import Dashboard from './main/Dashboard'
import ProfilePage from './main/ProfilePage'

import './main/styles.scss'

import settings from '../../web-settings.json'

const NOTIFICATION_AUTOCLOSE = 5000

export const AppContext = React.createContext()

const Main = () => {
  const [notifications,setNotifications] = React.useState([])

  function removeNotification(notification) {
    var notifIndex = notifications.indexOf(notification)

    if (notifIndex !== -1) {
      setNotifications([
        ...notifications.slice(0, notifIndex),
        ...notifications.slice(notifIndex + 1)
      ])
    }
  }

  function notifyApp(message, type) {
    var notification = {
      message,
      type
    }

    setTimeout(function () {
      removeNotification(notification)
    }, NOTIFICATION_AUTOCLOSE)
  }

  const apiClient = createApiClient(settings)

  const { loginWithRedirect } = useAuth0()

  function login() {
    return loginWithRedirect()
  }

  return (
    <>
      <AppContext.Provider value={{ notifyApp, apiClient }}>
        <Switch>
          <Route path='/profile'><></></Route>
          <Route path='/'>
            <AppBar login={login} />
          </Route>
        </Switch>
        <Route exact path='/'>
          <DriveFeed />
        </Route>
        <Route path='/drive/:id'>
          <DrivePage />
        </Route>
        <Route path='/profile'>
          <ProfilePage />
        </Route>
        <Route path='/dashboard'>
          <Dashboard />
        </Route>
        <Route path='/organizer'>
          <DriveOrganizer />
        </Route>
        <Route path='/create-drive'>
          <DriveCreation />
        </Route>
      </AppContext.Provider>
      <NotificationGroup style={{ right: 0, bottom: 0 }}>
        {
          notifications.map((value, index) => (
            <Notification key={index} type={{ icon: true, style: value.type }} closable={true} onClose={() => removeNotification(value)}>
              {value.message}
            </Notification>
          ))
        }
      </NotificationGroup>
    </>
  )
}

export default hot(module)(Main)