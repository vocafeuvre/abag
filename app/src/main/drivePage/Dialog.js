import React from 'react'
import { Button } from '@progress/kendo-react-buttons'

const Dialog = props => {
  var iconClassName = '', stateClassName = ''

  if (props.type === 'error') {
    iconClassName = 'k-i-warning '
    stateClassName = 'dialog-icon--error '
  } else if (props.type === 'success') {
    iconClassName = 'k-i-bell '
    stateClassName = 'dialog-icon--success '
  } else {
    iconClassName = 'k-i-info '
  }

  return (
    <div className='dialog'>
      <div className={iconClassName + stateClassName + 'dialog-icon'}></div>
      <div className='dialog-message'>{props.message}</div>
      <Button onClick={props.closeDialog}>OK</Button>
    </div>
  )
}

export default Dialog