import React from 'react'

import { DropDownList } from '@progress/kendo-react-dropdowns'

const DriveFilter = props => {
    return (
        <DropDownList data={props.filters}
                      defaultItem={props.filters[0]}/>
    )
}

export default DriveFilter