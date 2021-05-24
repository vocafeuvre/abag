import React from 'react'
import { hot } from 'react-hot-loader'
import { useAuth0 } from '@auth0/auth0-react'

import { Notification, NotificationGroup } from '@progress/kendo-react-notification'
import { Route, Switch } from 'react-router-dom'

import AppBar from './main/AppBar'
import DriveFeed from './main/DriveFeed'
import DrivePage from './main/DrivePage'
import DriveOrganizer from './main/DriveOrganizer'
import DriveCreation from './main/DriveCreation'
import Dashboard from './main/UserDashboard'
import ProfilePage from './main/ProfilePage'

import './main/styles.scss'
import settings from '../../web-settings.json'

const NOTIFICATION_AUTOCLOSE = 5000

const AUTH_WITH_API_SERVER = 1000

const Main = props => {
  const apiClient = props.apiClient
  const [profile,setProfile] = React.useState(null)
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

  function notifyApp(notification) {
    setNotifications([
      ...notifications,
      notification
    ])

    setTimeout(function () {
      removeNotification(notification)
    }, NOTIFICATION_AUTOCLOSE)
  }

  const { loginWithRedirect, logout: auth0Logout, isAuthenticated, user, getAccessTokenSilently } = useAuth0()

  function login() {
    return loginWithRedirect().catch(function (err) {
            console.error(err)
            notifyApp({
              message: 'Unable to authenticate with Auth0.',
              type: 'error'
            })
          })
  }

  function logout() {
    var prevLocation = window.location.origin
    return auth0Logout({ returnTo: prevLocation })
  }

  function authWithApiServer() {
    getAccessTokenSilently().then(function (token) {
      apiClient.authenticate(token).then(function (apiUser) {
        console.log('api-user', apiUser)

        if (apiUser) {
          setProfile({
            avatar: user.picture,
            email: user.email,
            givenName: user.given_name,
            lastName: user.last_name,
            contactNumber: user.phone_number,
            address: user.address,
            gender: user.gender,
            bio: apiUser.bio,
            city: apiUser.city,
            province: apiUser.province,
            zipCode: apiUser.zipCode,
            country: apiUser.country
          })

          notifyApp({
            message: 'Connected to backend, app fully operational',
            type: 'success'
          })
        }
      }).catch(function (err) {
        console.error(err)
        notifyApp({
          message: 'Unable to authenticate to backend, features are limited.',
          type: 'error'
        })

        setTimeout(function () {
          authWithApiServer()
        }, AUTH_WITH_API_SERVER)
      })
    }).catch(function (err) {
      console.error(err)
      notifyApp({
        message: 'Unable to authenticate properly, logging out...',
        type: 'error'
      })
      logout()
    })
  }

  if (isAuthenticated) {
    if (!profile) {
      setProfile({
        avatar: user.picture,
        email: user.email,
        givenName: user.given_name,
        lastName: user.last_name,
        contactNumber: user.phone_number,
        address: user.address,
        gender: user.gender
      })

      notifyApp({
        message: 'Welcome back, ' + user.given_name + '!',
        type: 'success'
      })

      authWithApiServer()
    }

    console.log('hey!', user)
  }

  return (
    <>
      <Switch>
        <Route path='/profile'><></></Route>
        <Route path='/'>
          <AppBar login={login} logout={logout} account={isAuthenticated && user} />
        </Route>
      </Switch>
      <Route exact path='/'>
        <DriveFeed />
      </Route>
      <Route path='/drive/:id'>
        <DrivePage isAuthed={isAuthenticated} login={login} notifyApp={notifyApp} apiClient={apiClient} />
      </Route>
      {
        isAuthenticated && (
          <>
            <Route path='/profile'>
              <ProfilePage profile={profile} notifyApp={notifyApp} apiClient={apiClient} />
            </Route>
            <Route path='/dashboard'>
              <Dashboard />
            </Route>
            <Route path='/organizer'>
              <DriveOrganizer />
            </Route>
            <Route path='/create-drive'>
              <DriveCreation notifyApp={notifyApp} apiClient={apiClient} />
            </Route>
          </>
        )
      }
      <NotificationGroup style={{ right: 0, bottom: 0 }}>
        {
          notifications.map((value, index) => { return (
            <Notification key={index} type={{ icon: true, style: value.type }} closable={true} onClose={() => removeNotification(value)}>
              {value.message}
            </Notification>
          )})
        }
      </NotificationGroup>
    </>
  )
}

export default hot(module)(Main)