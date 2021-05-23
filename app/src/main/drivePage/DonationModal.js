import * as React from "react"

import { Button } from '@progress/kendo-react-buttons'
import { Form, Field, FormElement } from '@progress/kendo-react-form'

import { FormDropDownList, FormNumericTextBox, FormTextArea, FormUpload } from './donationModal/components'
import { requiredValidator } from './donationModal/validators'

const DonationModal = props => {
  const handleSubmit = dataItem => {
    props.sendDonationAttempt({
      currency: dataItem['donation-currency'],
      value: dataItem['donation-value'],
      description: dataItem['donation-description'],
      images: dataItem['donation-images']
    })
  }

  return (
    <>
      <h2 className='donation-modal-title'>Make a Donation</h2>
      <Button className='donation-modal-close' look='clear' icon='close' onClick={props.closeModal} />
      <Form onSubmit={handleSubmit} render={formRenderProps => (
          <FormElement>
            <Field
              id={'__donation-currency'}
              name={'currency'}
              label={'Currency'}
              component={FormDropDownList}
              validator={requiredValidator}
              data={props.currencies}
            />
            <Field
              id={"__donation-value"}
              name={"donation-value"}
              label={"Amount"}
              hint={"Hint: Amount of money equivalent to this donation."}
              format={"n2"}
              component={FormNumericTextBox}
            />
            <Field
              id={"__donation-description"}
              name={"donation-description"}
              label={"Description"}
              hint={"Hint: Describe this donation."}
              component={FormTextArea}
            />
            <Field
              id={"__donation-images"}
              name={"donation-images"}
              label={"Photos"}
              hint={"Hint: Take pictures of your donation."}
              component={FormUpload}
            />
            <div className="k-form-buttons">
              <Button
                primary={true}
                type={"submit"}
                disabled={!formRenderProps.allowSubmit}
              >
                Send Donation
              </Button>
            </div>
          </FormElement>
        )}
      />
    </>
  )
}

export default DonationModal