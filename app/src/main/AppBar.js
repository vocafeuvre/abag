import React from 'react'

import { AppBar, AppBarSection, AppBarSpacer, Avatar, Menu, MenuItem, MenuItemLink } from '@progress/kendo-react-layout'
import { Button } from '@progress/kendo-react-buttons'
import { Popup } from '@progress/kendo-react-popup'

import abagIcon from '../assets/abag-icon-white.svg'
import './appBar/styles.scss'
import { Link } from 'react-router-dom'

const NavBar = props => {
  var anchor = React.useRef(null)
  var [showPopup, setShow] = React.useState(false)

  const onClick = () => {
    setShow(!showPopup);
  }

  return (
    <AppBar positionMode="fixed" themeColor='inherit'>
      <nav className='appbar-container'>
        <AppBarSection>
          <img src={abagIcon} alt="abag icon" />
        </AppBarSection>
        <AppBarSpacer></AppBarSpacer>
        <AppBarSection>
          {
            props.account 
            ?
              <>
                <Avatar shape="circle" type="image">
                  <img src={props.account && props.account.picture} alt="avatar" onClick={onClick} ref={anchor} />
                </Avatar>
                <Popup anchor={anchor.current} show={showPopup} popupClass={"popup-content"}>
                  <ul className='appbar-menu'>
                    <li className='appbar-menu__link'>
                      <Link to='/profile'>Go to profile</Link>
                    </li>
                    <li className='appbar-menu__link appbar-menu__link--actionable' onClick={props.logout}>
                      Logout
                    </li>
                  </ul>
                </Popup>
              </>
            :
              <Button look='clear' onClick={props.login} className={'signin-button'}>Sign in</Button>
          }
        </AppBarSection>
      </nav>
    </AppBar>
  )
}

export default NavBar


          // <Menu>
          //   <MenuItem text='hey' linkRender={props => { console.log('gg', props); return (
          //     <MenuItemLink url={props.item.url} opened={props.opened}>
          //       <Avatar shape="circle" type="image">
          //         <img src={props.account.picture} alt="avatar" />
          //       </Avatar>
          //     </MenuItemLink>
          //   )}}>
          //     <MenuItem linkRender={props => (
          //       <MenuItemLink url={props.item.url} opened={props.opened}>
          //         <Link to='/profile'>
          //           Go to profile
          //         </Link>
          //       </MenuItemLink>
          //     )} />
          //   </MenuItem>
          // </Menu>