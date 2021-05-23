import * as React from "react"

import { DropDownList } from '@progress/kendo-react-dropdowns'
import { Label, Error, Hint, FloatingLabel } from '@progress/kendo-react-labels'
import { FieldWrapper } from '@progress/kendo-react-form'
import { Upload } from '@progress/kendo-react-form'
import { NumericTextBox, TextArea } from '@progress/kendo-react-inputs'

export const FormDropDownList = fieldRenderProps => {
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    disabled,
    hint,
    wrapperStyle,
    ...others
  } = fieldRenderProps
  const editorRef = React.useRef(null)

  const showValidationMessage = touched && validationMessage
  const showHint = !showValidationMessage && hint
  const hintId = showHint ? `${id}_hint` : ""
  const errorId = showValidationMessage ? `${id}_error` : ""
  const labelId = label ? `${id}_label` : ""

  return (
    <FieldWrapper style={wrapperStyle}>
      <Label
        id={labelId}
        editorRef={editorRef}
        editorId={id}
        editorValid={valid}
        editorDisabled={disabled}
      >
        {label}
      </Label>
      <DropDownList
        ariaLabelledBy={labelId}
        ariaDescribedBy={`${hintId} ${errorId}`}
        ref={editorRef}
        valid={valid}
        id={id}
        disabled={disabled}
        {...others}
      />
      {showHint && <Hint id={hintId}>{hint}</Hint>}
      {showValidationMessage && <Error id={errorId}>{validationMessage}</Error>}
    </FieldWrapper>
  )
}

export const FormUpload = fieldRenderProps => {
  const {
    valid,
    value,
    id,
    optional,
    label,
    hint,
    validationMessage,
    touched,
    ...others
  } = fieldRenderProps

  const showValidationMessage = touched && validationMessage
  const showHint = !showValidationMessage && hint
  const hintId = showHint ? `${id}_hint` : ""
  const errorId = showValidationMessage ? `${id}_error` : ""
  const labelId = label ? `${id}_label` : ""

  const onChangeHandler = (event) => {
    fieldRenderProps.onChange({ value: event.newState })
  }
  const onRemoveHandler = (event) => {
    fieldRenderProps.onChange({ value: event.newState })
  }

  return (
    <FieldWrapper>
      <Label id={labelId} editorId={id} editorValid={valid} optional={optional}>
        {label}
      </Label>
      <Upload
        id={id}
        valid={valid}
        autoUpload={false}
        showActionButtons={false}
        multiple={false}
        files={value}
        onAdd={onChangeHandler}
        onRemove={onRemoveHandler}
        ariaDescribedBy={`${hintId} ${errorId}`}
        ariaLabelledBy={labelId}
        {...others}
      />
      {showHint && <Hint id={hintId}>{hint}</Hint>}
      {showValidationMessage && <Error id={errorId}>{validationMessage}</Error>}
    </FieldWrapper>
  )
}

export const FormNumericTextBox = fieldRenderProps => {
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    disabled,
    hint,
    ...others
  } = fieldRenderProps

  const showValidationMessage = touched && validationMessage
  const showHint = !showValidationMessage && hint
  const hintId = showHint ? `${id}_hint` : ""
  const errorId = showValidationMessage ? `${id}_error` : ""

  return (
    <FieldWrapper>
      <Label editorId={id} editorValid={valid} editorDisabled={disabled}>
        {label}
      </Label>
      <NumericTextBox
        ariaDescribedBy={`${hintId} ${errorId}`}
        valid={valid}
        id={id}
        disabled={disabled}
        {...others}
      />
      {showHint && <Hint id={hintId}>{hint}</Hint>}
      {showValidationMessage && <Error id={errorId}>{validationMessage}</Error>}
    </FieldWrapper>
  )
}

export const FormTextArea = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    hint,
    disabled,
    optional,
    ...others
  } = fieldRenderProps

  const showValidationMessage = touched && validationMessage
  const showHint = !showValidationMessage && hint
  const hintId = showHint ? `${id}_hint` : ""
  const errorId = showValidationMessage ? `${id}_error` : ""

  return (
    <FieldWrapper>
      <Label editorId={id} editorValid={valid} optional={optional}>
        {label}
      </Label>
      <TextArea
        valid={valid}
        id={id}
        disabled={disabled}
        ariaDescribedBy={`${hintId} ${errorId}`}
        {...others}
      />
      {showHint && <Hint id={hintId}>{hint}</Hint>}
      {showValidationMessage && <Error id={errorId}>{validationMessage}</Error>}
    </FieldWrapper>
  )
}