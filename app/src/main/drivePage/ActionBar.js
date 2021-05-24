import React from 'react'

import { Button } from '@progress/kendo-react-buttons'

const ActionBar = props => {
  return (
    props.isAuthed 
    ?
      <>
        <Button className='donation-button' onClick={props.onDonation} icon={'heart'} >Donate</Button>
        <Button className='volunteer-button' onClick={props.onVolunteer} icon={'tell-a-friend'} >Volunteer</Button>
      </>
    :
      <Button className='action-bar-signin' onClick={props.login} >Sign in</Button>
  )
}

export default ActionBar