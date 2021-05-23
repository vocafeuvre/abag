import * as React from "react"

import { Button } from '@progress/kendo-react-buttons'
import { Form, Field, FormElement } from '@progress/kendo-react-form'

import { FormMultiViewCalendar, FormTextArea, FormChipList } from './volunteerModal/components'
import { requiredValidator } from './volunteerModal/validators'

const VolunteerModal = props => {
  const handleSubmit = dataItem => {
    props.sendVolunteerRequest({
      message: dataItem['volunteer-message'],
      schedule: dataItem['volunteer-schedule'],
      skills: dataItem['volunteer-skills']
    })
  }

  return (
    <>
      <h2 className='volunteer-modal-title'>Request to Volunteer</h2>
      <Button className='volunteer-modal-close' look='clear' icon='close' onClick={props.closeModal} />
      <Form onSubmit={handleSubmit} render={formRenderProps => (
          <FormElement>
            <Field
              id={"__volunteer-message"}
              name={"volunteer-message"}
              label={"Message"}
              hint={"Hint: Make a message introducing yourself."}
              component={FormTextArea}
              validator={requiredValidator}
            />
            <Field
              id={"__volunteer-schedule"}
              name={"volunteer-schedule"}
              label={"Schedule"}
              hint={"Hint: Set your schedule."}
              component={FormMultiViewCalendar}
              views={1}
            />
            <Field
              id={"__volunteer-skills"}
              name={"volunteer-skills"}
              label={"Skills"}
              component={FormChipList}
            />
            <div className="k-form-buttons">
              <Button
                primary={true}
                type={"submit"}
                disabled={!formRenderProps.allowSubmit}
              >
                Send Request
              </Button>
            </div>
          </FormElement>
        )}
      />
    </>
  )
}

export default VolunteerModal