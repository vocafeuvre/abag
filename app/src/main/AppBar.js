import React from 'react'

import { AppBar, AppBarSection, Avatar } from '@progress/kendo-react-layout'
import { Button } from '@progress/kendo-react-buttons'

// TODO: we haven't coded the avatar dropdown yet
const AppBar = props => (
  <AppBar positionMode="fixed">
    <AppBarSection>
      <img src={props.abagIcon} alt="abag icon" />
    </AppBarSection>
    <AppBarSection>
      {
        props.account 
        ?
          <Button look='clear' onClick={props.login}>Sign in</Button>
        :
          <Avatar shape="circle" type="image">
            <img src={props.account.avatar} alt="avatar" />
          </Avatar>
      }
    </AppBarSection>
  </AppBar>
)

export default AppBar