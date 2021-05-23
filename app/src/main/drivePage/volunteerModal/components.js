import * as React from "react"

import { Label, Error, Hint, FloatingLabel } from '@progress/kendo-react-labels'
import { MultiViewCalendar } from '@progress/kendo-react-dateinputs'
import { FieldWrapper } from '@progress/kendo-react-form'
import { TextArea } from '@progress/kendo-react-inputs'
import { ChipList } from "@progress/kendo-react-buttons"

export const FormMultiViewCalendar = fieldRenderProps => {
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

  const showValidationMessage = touched && validationMessage
  const showHint = !showValidationMessage && hint
  const hintId = showHint ? `${id}_hint` : ""
  const errorId = showValidationMessage ? `${id}_error` : ""
  const labelId = label ? `${id}_label` : ""

  const onChangeHandler = (event) => {
    fieldRenderProps.onChange({ value: event.value })
  }

  return (
    <FieldWrapper style={wrapperStyle}>
      <Label
        id={labelId}
        editorId={id}
        editorValid={valid}
        editorDisabled={disabled}
      >
        {label}
      </Label>
      <MultiViewCalendar
        ariaLabelledBy={labelId}
        ariaDescribedBy={`${hintId} ${errorId}`}
        valid={valid}
        id={id}
        disabled={disabled}
        mode={'multiple'}
        onChange={onChangeHandler}
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

export const FormChipList = (fieldRenderProps) => {
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

  const onChangeHandler = (event) => {
    fieldRenderProps.onChange({ value: event.value })
  }

  return (
    <FieldWrapper>
      <Label editorId={id} editorValid={valid} optional={optional}>
        {label}
      </Label>
      <ChipList
        valid={valid}
        id={id}
        disabled={disabled}
        ariaDescribedBy={`${hintId} ${errorId}`}
        onDataChange={onChangeHandler}
        selection='multiple'
        {...others}
      />
      {showHint && <Hint id={hintId}>{hint}</Hint>}
      {showValidationMessage && <Error id={errorId}>{validationMessage}</Error>}
    </FieldWrapper>
  )
}