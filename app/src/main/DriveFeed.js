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
  var drives = []
  var filtersApplied = false

  const observePossibleSearches = callback => {

  }

  const handleSearch = hit => {

  }

  return (
    <section className='drive-feed'>
      {
        drives.length === 0 && filtersApplied
          ?
            <>
              <DriveFilter filters={filters} />
              <DriveSearch />
              <DriveView drives={drives}/>
            </>
          :
            <div className='drive-feed__no-entries'>
              <div className='k-icon k-i-info drive-feed__no-entries-icon'></div>
              <div className='drive-feed__no-entries-title'>
                Uhm, no drives organized yet
              </div>
              <div className='drive-feed__no-entries-desc'>
                Why don't you organize the first drive yourself?
              </div>
            </div>
      }
    </section>
  )
}

export default DriveFeed