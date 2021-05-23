import React from 'react'

import { Button } from '@progress/kendo-react-buttons'
import { Form, Field, FormElement } from '@progress/kendo-react-form'

import { FormMultiViewCalendar, FormTextArea, FormList, FormInput, FormUpload, FormGoogleMap } from './driveCreation/components'
import { requiredValidator } from './driveCreation/validators'

import { AppContext } from '../Main'

const DriveCreation = () => {
  return (
    <AppContext.Consumer>
      {({ notifyApp, apiClient }) => {
        const handleSubmit = props => {
          var dataItem = props.dataItem
          apiClient.organizeDrive({
            title: dataItem['drive-title'],
            description: dataItem['drive-description'],
            location: dataItem['drive-location'],
            duration: dataItem['drive-duration'],
            needs: dataItem['drive-needs'],
            image: dataItem['drive-image'],
          })
            .then(function () {
              notifyApp({
                message: 'Drive successfully created!',
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
          <section className='drive-creation-page'>
            <nav className='back-container back-container--light'>
              <div className='back-container__link'>
                <Link to='/'>
                  <span className='k-icon k-i-arrow-left'></span> Back to Home
                </Link>
              </div>
            </nav>
            <h1 className='drive-modal-title'>Organize a Drive</h1>
            <Form onSubmit={handleSubmit} render={formRenderProps => (
                <FormElement>
                  <Field
                    id={"__drive-title"}
                    name={"drive-title"}
                    label={"Title"}
                    component={FormInput}
                    validator={requiredValidator}
                  />
                  <Field
                    id={"__drive-description"}
                    name={"drive-description"}
                    label={"Description"}
                    hint={"Hint: Describe what the drive is all about."}
                    component={FormTextArea}
                    validator={requiredValidator}
                  />
                  <Field
                    id={"__drive-location"}
                    name={"drive-location"}
                    label={"Location"}
                    hint={"Hint: Location of the drive."}
                    component={FormGoogleMap}
                  />
                  <Field
                    id={"__drive-duration"}
                    name={"drive-duration"}
                    label={"Duration"}
                    hint={"Hint: Duration of the drive."}
                    component={FormMultiViewCalendar}
                    views={1}
                  />
                  <Field
                    id={"__drive-needs"}
                    name={"drive-needs"}
                    label={"Needs"}
                    component={FormList}
                  />
                  <Field
                    id={"__drive-image"}
                    name={"drive-image"}
                    label={"Main Photo"}
                    hint={"Hint: Upload a photo for your drive."}
                    component={FormUpload}
                  />
                  <div className="k-form-buttons">
                    <Button
                      primary={true}
                      type={"submit"}
                      disabled={!formRenderProps.allowSubmit}
                    >
                      Organize Drive
                    </Button>
                  </div>
                </FormElement>
              )}
            />
          </section>
        )
      }}
    </AppContext.Consumer>
  )
}

export default DriveCreation