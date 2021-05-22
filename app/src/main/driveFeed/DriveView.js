import React from 'react'

import { ListView } from '@progress/kendo-react-listview'

const DriveViewEntry = props => {
  <div class="drive-view-entry">
    <img class="drive-view-entry__pic" src={props.mainPic} alt={props.mainPicAlt} />
    <div class="drive-view-entry__info">
      <div class="drive-view-entry__title">{props.title}</div>
      <div class="drive-view-entry__subtext">{props.address}</div>
    </div>
    <div class="drive-view-entry__organizer">
      <img class="drive-view-entry__organizer-avatar" src={props.organizerAvatar} />
      <div class="drive-view-entry__organizer-name">{props.organizerName}</div>
    </div>
    <div class="drive-view-entry-stats">
      <div class="drive-view-entry__stat">
        <span class="drive-view-entry__stat-icon drive-view-entry__stat-icon__volunteer"></span>
        <span class="drive-view-entry__stat-value">{props.volunteerCount}</span>
      </div>
      <div class="drive-view-entry__stat">
        <span class="drive-view-entry__stat-icon drive-view-entry__stat-icon__donation"></span>
        <span class="drive-view-entry__stat-value">{props.donationCount}</span>
      </div>
    </div>
  </div>
}

const DriveView = props => {
  return (
    <ListView 
        data={props.drives}
        item={props => <DriveViewEntry {...props.dataItem} />}
      />
  )
}

export default DriveView