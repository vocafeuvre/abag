import React from 'react'

import DetailsPanel from './drivePage/DetailsPanel'
import ActionBar from './drivePage/ActionBar'

const DrivePage = props => {

  function handleVolunteerRequest() {

  }

  function handleDonationAttempt() {

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
        <ActionBar onVolunteer={handleVolunteerRequest} onDonation={handleDonationAttempt}/>
      </div>
    </section>
  )
}

export default DrivePage