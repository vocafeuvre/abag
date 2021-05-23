import React from 'react'

import { Button } from '@progress/kendo-react-buttons'

const ActionBar = props => {
  return (
    <>
      <Button className='donation-button' onClick={props.onDonation} icon={'heart'} >Donate</Button>
      <Button className='volunteer-button' onClick={props.onVolunteer} icon={'tell-a-friend'} >Volunteer</Button>
    </>
  )
}

export default ActionBar