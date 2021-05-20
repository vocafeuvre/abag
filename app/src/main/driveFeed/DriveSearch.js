import React, { useState } from 'react'

import { AutoComplete } from "@progress/kendo-react-dropdowns"

const DriveSearch = props => {
  const [entries, setEntries] = useState([])

  const handleSearch = evt => {
    props.searchDrives(evt.target.value)
  }

  props.observePossibleSearches(values => {
    setEntries([...values])
  })

  return (
    <AutoComplete name="search" 
                  data={entries}
                  suggest={true}
                  placeholder="Search for drives" 
                  onChange={handleSearch} 
      />
  )
}

export default DriveSearch