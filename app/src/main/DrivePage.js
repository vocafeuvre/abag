import React from 'react'

import DetailsPanel from './drivePage/DetailsPanel'
import ActionBar from './drivePage/ActionBar'
import DonationModal from './drivePage/DonationModal'
import { Route, useRouteMatch, useHistory } from 'react-router'

const DrivePage = props => {
  var match = useRouteMatch()
  var history = useHistory()

  var apiClient = props.apiClient

  function openDonationModal() {
    history.push(match.path + '/donate')
  }

  function openVolunteerModal() {
    history.push(match.path + '/volunteer')
  }

  function closeModal(evt) {
    evt.stopPropagation()
    history.goBack()
  }
  
  var notifyApp = props.notifyApp

  function sendVolunteerRequest(request) {
    closeModal()

    apiClient.sendVolunteerRequest({
      drive: props.drive,
      ...request
    })
      .then(function () {
        notifyApp({
          message: 'Sucessfully sent volunteer request!',
          type: 'success'
        })
      })
      .catch(function (err) {
        notifyApp({
          message: err,
          type: 'error'
        })
      })
  }

  function sendDonationAttempt(attempt) {
    closeModal()
    
    apiClient.sendDonationAttempt({
      drive: props.drive,
      ...attempt
    })
      .then(function () {
        notifyApp({
          message: 'Sucessfully sent donation attempt!',
          type: 'success'
        })
      })
      .catch(function (err) {
        notifyApp({
          message: err,
          type: 'error'
        })
      })
  }

  return (
    <section className='drive-page'>
      <div className="details-panel-container">
        <DetailsPanel title={props.details.title}
                      about={props.details.about} 
                      location={props.details.location} 
                      timeline={props.details.timeline}/>
      </div>
      <div className='action-bar-container'>
        <ActionBar isAuthed={props.isAuthed} login={props.login} onVolunteer={openVolunteerModal} onDonation={openDonationModal} />
      </div>
      <Route path={match.path + '/donate'}>
        <div className={'donation-modal'}>
          <DonationModal sendDonationAttempt={sendDonationAttempt} closeModal={closeModal} />
        </div>
      </Route>
      <Route path={match.path + '/volunteer'}>
        <div className={'volunteer-modal'}>
          <VolunteerModal sendVolunteerRequest={sendVolunteerRequest} closeModal={closeModal} />
        </div>
      </Route>
    </section>
  )
}

export default DrivePage