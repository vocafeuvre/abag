import { FloatingActionButton } from '@progress/kendo-react-buttons'
import { Input, MaskedTextBox, TextArea } from '@progress/kendo-react-inputs'
import { FloatingLabel } from '@progress/kendo-react-labels'
import React from 'react'
import { Link } from 'react-router-dom'

import abagIcon from '../assets/abag-icon-white.svg'
import './profilePage/styles.scss'

const ProfilePage = props => {
  var [editMode,setEditMode] = React.useState(false)
  var [profile, setProfile] = React.useState(props.profile && {
    avatar: props.profile.avatar,
    email: props.profile.email,
    bio: props.profile.bio,
    givenName: props.profile.givenName || '',
    lastName: props.profile.lastName,
    contactNumber: props.profile.contactNumber,
    address: props.profile.address,
    city: props.profile.city,
    province: props.profile.province,
    zipCode: props.profile.zipCode,
    country: props.profile.country
  })

  var apiClient = props.apiClient
  var notifyApp = props.notifyApp

  function toggleEditMode() {
    if (editMode) {
      apiClient.saveProfile(profile)
        .then(function () {
          notifyApp({
            message: 'Profile is successfully saved.',
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

    setEditMode(!editMode)
  }

  return (
    <section className='profile-page'>
      <nav className='back-container'>
        <div className='back-container__link'>
          <Link to='/'>
            <span className='k-icon k-i-arrow-left'></span> Back to Home
          </Link>
        </div>
        <div className='back-container__icon'>
          <img src={abagIcon} alt="abag icon" />
        </div>
      </nav>
      {
        !!profile && (
          <>
            <div className='profile-container'>
              <div className='profile-details'>
                <div className='profile-avatar'>
                  <img src={profile.avatar} alt={profile.givenName} />
                </div>
                <div className='profile-details__name'>{(profile.givenName || '') + (profile.givenName && ' ') + (profile.lastName || '')}</div>
                { editMode ? 
                            <FloatingLabel editorId='__profile-details-bio' editorValue={profile.bio} label={'Bio'}>
                              <TextArea id='__profile-details-bio' className='profile-details__bio profile-details__bio--edit' 
                                        onChange={evt => { setProfile({...profile, bio: evt.value }) }}>
                                {profile.bio}
                              </TextArea> 
                            </FloatingLabel>
                          : 
                            <div className='profile-details__bio'>{profile.bio || 'Bio not set.'}</div> 
                }
                { editMode ? 
                            <FloatingLabel editorId='__profile-details-email' editorValue={profile.email} label={'Email'}>
                              <MaskedTextBox id='__profile-details-email' className='profile-details__email profile-details__email--edit' 
                                            mask='E'
                                            rules={{
                                              E: /\S+@\S+\.\S+/
                                            }}
                                            onChange={evt => {
                                                setProfile({...profile, email: evt.value })
                                              }}
                                            value={profile.email} /> 
                            </FloatingLabel>
                          : 
                            <div className='profile-details__email'>{profile.email}</div> 
                }
                { editMode ? 
                            <FloatingLabel editorId='__profile-details-contact' editorValue={profile.contactNumber} label={'Contact Number'}>
                              <MaskedTextBox id='__profile-details-contact' className='profile-details__contact profile-details__contact--edit' 
                                            mask='(999) 000-00-00-00'
                                            onChange={evt => {
                                                setProfile({...profile, contactNumber: evt.value })
                                              }}
                                            value={profile.contactNumber} /> 
                            </FloatingLabel>
                          : 
                            <div className='profile-details__contact'>{profile.contactNumber || 'Contact number not set.'}</div> 
                }
                { editMode ? 
                            <FloatingLabel editorId='__profile-details-address' editorValue={profile.address} label={'Address'}>
                              <TextArea id='__profile-details-address' className='profile-details__address profile-details__address--edit' 
                                        onChange={evt => { setProfile({...profile, address: evt.value }) }}>
                                {profile.address}
                              </TextArea> 
                            </FloatingLabel>
                          : 
                            <div className='profile-details__address'>{profile.address || 'Address not set.'}</div> 
                }
                { editMode ? 
                            <FloatingLabel editorId='__profile-details-city' editorValue={profile.city} label={'City'}>
                              <Input id='__profile-details-city' className='profile-details__city profile-details__city--edit' 
                                    onChange={evt => { setProfile({...profile, city: evt.value }) }} 
                                    value={profile.city}
                              />
                            </FloatingLabel>
                          : 
                            <div className='profile-details__city'>{profile.city || 'City not set.'}</div> 
                }
                { editMode ? 
                            <FloatingLabel editorId='__profile-details-state' editorValue={profile.state} label={'State'}>
                              <Input id='__profile-details-state' className='profile-details__state profile-details__state--edit' 
                                    onChange={evt => { setProfile({...profile, state: evt.value }) }} 
                                    value={profile.state}
                              />
                            </FloatingLabel>
                          : 
                            <div className='profile-details__state'>{profile.state || 'Province not set.'}</div> 
                }
                { editMode ? 
                            <FloatingLabel editorId='__profile-details-zipcode' editorValue={profile.zipCode} label={'Zip Code'}>
                              <Input id='__profile-details-zipcode' className='profile-details__zipcode profile-details__zipcode--edit' 
                                    onChange={evt => { setProfile({...profile, zipCode: evt.value }) }} 
                                    value={profile.zipCode}
                              />
                            </FloatingLabel>
                          : 
                            <div className='profile-details__zipcode'>{profile.zipCode || 'Zip Code not set.'}</div> 
                }
                { editMode ? 
                            <FloatingLabel editorId='__profile-details-country' editorValue={profile.country} label={'Country'}>
                              <Input id='__profile-details-country' className='profile-details__country profile-details__country--edit' 
                                    onChange={evt => { setProfile({...profile, country: evt.value }) }} 
                                    label={''}
                                    value={profile.country}
                              />
                            </FloatingLabel>
                          : 
                            <div className='profile-details__country'>{profile.country || 'Country not set.'}</div> 
                }
              </div>
            </div>
            <FloatingActionButton 
              icon='edit'
              align={{
                horizontal: "end",
                vertical: "bottom",
              }}
              positionMode="absolute"
              onClick={toggleEditMode}
            />
          </>
        )
      }
    </section>
  )
}

export default ProfilePage