import React from 'react'

import DriveFilter from './driveFeed/DriveFilter'
import DriveSearch from './driveFeed/DriveSearch'
import DriveView from './driveFeed/DriveView'

import './driveFeed/styles.scss'

const filters = [
  'Most Recent',
  "What's Popular",
  'Nearest You'
]

// TODO: just do all your logic inside DriveFeed

// NOTE: think it's really neat for logic to be in higher components, we don't need state management that way
// we localize the data fetching to the components themselves, if we do need consolidation of data, we enforce
// that it should remain in server-land

const DriveFeed = () => {
  const [] = React.useState()

  const observePossibleSearches = callback => {

  }

  const handleSearch = hit => {

  }

  return (
    <div>
      <DriveFilter filters={filters} />
      <DriveSearch />
      <DriveView drives={}/>
    </div>
  )
}

export default DriveFeed