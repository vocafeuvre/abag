import React from 'react'

import { AppBar, AppBarSection, Avatar } from '@progress/kendo-react-layout'

const AppBar = props => 
    <AppBar positionMode="fixed">
      <AppBarSection>
        <img src={props.abagIcon} alt="abag icon" />
      </AppBarSection>
      <AppBarSection>
        {
          props.account 
          ?
            <a>Sign in</a>
          :
            <Avatar shape="circle" type="image">
              <img src={props.account.avatar} alt="avatar" />
            </Avatar>
        }
      </AppBarSection>
    </AppBar>

export default AppBar