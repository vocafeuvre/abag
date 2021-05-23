import * as React from "react"

import { Label, Error, Hint, FloatingLabel } from '@progress/kendo-react-labels'
import { MultiViewCalendar } from '@progress/kendo-react-dateinputs'
import { FieldWrapper } from '@progress/kendo-react-form'
import { TextArea, Input } from '@progress/kendo-react-inputs'
import { Button, ChipList } from "@progress/kendo-react-buttons"
import { ListView, ListViewFooter } from "@progress/kendo-react-listview"
import { Card, CardBody } from "@progress/kendo-react-layout"

import { GoogleMap, useJsApiLoader } from '@react-google-maps/api'

import settings from '../../../../web-settings.json'

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

export const FormInput = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    disabled,
    hint,
    type,
    optional,
    ...others
  } = fieldRenderProps

  const showValidationMessage = touched && validationMessage
  const showHint = !showValidationMessage && hint
  const hintId = showHint ? `${id}_hint` : ""
  const errorId = showValidationMessage ? `${id}_error` : ""

  return (
    <FieldWrapper>
      <Label
        editorId={id}
        editorValid={valid}
        editorDisabled={disabled}
        optional={optional}
      >
        {label}
      </Label>
      <div className={"k-form-field-wrap"}>
        <Input
          valid={valid}
          type={type}
          id={id}
          disabled={disabled}
          ariaDescribedBy={`${hintId} ${errorId}`}
          {...others}
        />
        {showHint && <Hint id={hintId}>{hint}</Hint>}
        {showValidationMessage && (
          <Error id={errorId}>{validationMessage}</Error>
        )}
      </div>
    </FieldWrapper>
  )
}

const FormListAdder = props => {
  const [item, setItem] = React.useState({ description: '' })

  return (
    <ListViewFooter style={{ display: 'flex', justifyContent: 'space-between' }}>
      <FloatingLabel editorId={'__create-drive-item-desc'} editorValue={item.description} label={'Description'} style={{ flex: 1 }}>
        <Input id={'__create-drive-item-desc'} className='drive-item__description drive-item__description--edit' 
              onChange={evt => { setItem({...item, description: evt.value }) }}
              value={item.description}
        />
      </FloatingLabel>
      <Button onClick={() => { props.addItem(item) }}>Add</Button>
    </ListViewFooter>
  )
}

const FormListItem = props => {
  const [editMode, setEditMode] = React.useState(false)
  const [item, setItem] = React.useState({ ...props.item })

  function toggleEditMode() {
    if (editMode) {
      props.saveItem(item)
    }

    setEditMode(!editMode)
  }

  return (
    <div key={props.dataItem.index}>
      <Card
        orientation="horizontal"
        style={{
          borderWidth: "0px 0px 1px",
        }}
      >
        <CardBody>
          { editMode ? 
            <FloatingLabel editorId={'__save-drive-item-desc' + '-' + props.dataItem.index} editorValue={item.description} label={'Description'}>
              <Input id={'__save-drive-item-desc' + '-' + props.dataItem.index} className='drive-item__description drive-item__description--edit' 
                    onChange={evt => { setItem({...item, description: evt.value }) }} 
                    value={item.description}
              />
            </FloatingLabel>
          : 
            <div className='drive-item__description'>{profile.description}</div> 
          }
          <div style={{ marginTop: '5px' }}>
            <Button primary={true} onClick={() => { toggleEditMode() }}>{ editMode ? 'Save' : 'Edit' }</Button>
            <Button onClick={() => { props.removeItem(props.dataItem.index) }}>Remove</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export const FormList = (fieldRenderProps) => {
  const [items, setItems] = React.useState([])

  function addItem(item) {
    setItems([
      ...items,
      { ...item, index: items.length }
    ])

    fieldRenderProps.onChange({ value: items })
  }

  function saveItem(item) {
    setItems([
      ...items.slice(0, item.index),
      item,
      ...items.slice(item.index + 1)
    ])

    fieldRenderProps.onChange({ value: items })
  }

  function removeItem(index) {
    setItems([
      ...items.slice(0, index),
      ...items.slice(index + 1)
    ])

    fieldRenderProps.onChange({ value: items })
  }

  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    disabled,
    hint,
    type,
    optional,
    ...others
  } = fieldRenderProps

  const showValidationMessage = touched && validationMessage
  const showHint = !showValidationMessage && hint
  const hintId = showHint ? `${id}_hint` : ""
  const errorId = showValidationMessage ? `${id}_error` : ""

  return (
    <FieldWrapper>
      <Label
        editorId={id}
        editorValid={valid}
        editorDisabled={disabled}
        optional={optional}
      >
        {label}
      </Label>
      <div className={"k-form-field-wrap"}>
        <ListView
          data={items}
          item={props => <FormListItem {...props} saveItem={saveItem} removeItem={removeItem} />}
          footer={props => <FormListAdder {...props} addItem={addItem} />}
          {...others}
        />
        {showHint && <Hint id={hintId}>{hint}</Hint>}
        {showValidationMessage && (
          <Error id={errorId}>{validationMessage}</Error>
        )}
      </div>
    </FieldWrapper>
  )
}

export const MapContainer = React.memo(props => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: settings.google_maps_key
  })

  const [map, setMap] = React.useState(null)

  const onLoad = React.useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds();
    map.fitBounds(bounds);
    setMap(map)
  }, [])

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null)
  }, [])

  const defaultCenter = {
    lat: 41.3851, lng: 2.1734
  }

  const [currentPosition,setCurrentPosition] = React.useState(defaultCenter)

  const mapStyles = {
    minHeight: '300px',
    maxHeight: '300px',
    height: "100%",
    width: "100%"
  }

  const onMarkerDragEnd = (e) => {
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    setCurrentPosition({ lat, lng })
    props.updateLatLng({ lat, lng })
  }

  return (
    isLoaded ? <GoogleMap
      mapContainerStyle={mapStyles}
      defaultZoom={13}
      defaultCenter={defaultCenter}
      center={currentPosition}
      onLoad={onLoad}
      onUnmount={onUnmount}>
      {
        currentPosition.lat ? 
        <Marker
          position={currentPosition}
          onDragEnd={(e) => onMarkerDragEnd(e)}
          draggable={true} /> :
        null
      }
    </GoogleMap> : <></>
  )
})

export const FormGoogleMap = (fieldRenderProps) => {
  function onChangeHandler(value) {
    fieldRenderProps.onChange({ value })
  }

  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    disabled,
    hint,
    type,
    optional,
    ...others
  } = fieldRenderProps

  const showValidationMessage = touched && validationMessage
  const showHint = !showValidationMessage && hint
  const hintId = showHint ? `${id}_hint` : ""
  const errorId = showValidationMessage ? `${id}_error` : ""

  return (
    <FieldWrapper>
      <Label
        editorId={id}
        editorValid={valid}
        editorDisabled={disabled}
        optional={optional}
      >
        {label}
      </Label>
      <div className={"k-form-field-wrap"}>
        <MapContainer updateLatLng={onChangeHandler} />
        {showHint && <Hint id={hintId}>{hint}</Hint>}
        {showValidationMessage && (
          <Error id={errorId}>{validationMessage}</Error>
        )}
      </div>
    </FieldWrapper>
  )
}