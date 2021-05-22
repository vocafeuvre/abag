import React from 'react'
import { Link } from 'react-router-dom'
import { TabStrip, TabStripTab } from '@progress/kendo-react-layout'

import AboutTab from './detailsPanel/AboutTab'
import LocationTab from './detailsPanel/LocationTab'
import TimelineTab from './detailsPanel/TimelineTab'

const DetailsPanel = props => {
  const [selected, setSelected] = React.useState(1)

  const handleSelect = evt => {
    setSelected(evt.selected)
  }
      
  return (
    <>
      <Link to='/'>
        <span className="back-to-home">
          <i className="k-icon k-i-arrow-left"></i>
          Back to Home
        </span>
      </Link>
      <h1 className='drive-page-title'>{props.title}</h1>
      <div className='drive-page-tabs'>
        <TabStrip selected={selected} onSelect={handleSelect}>
          <TabStripTab title="About">
            <AboutTab {...props.about} />
          </TabStripTab>
          <TabStripTab title="Location">
            <LocationTab {...props.location} />
          </TabStripTab>
          <TabStripTab title="Timeline">
            <TimelineTab {...props.timeline} />
          </TabStripTab>
        </TabStrip>
      </div>
    </>
  )
}

export default DetailsPanel