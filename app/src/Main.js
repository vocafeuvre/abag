import React from 'react'
import { hot } from 'react-hot-loader'
import { useAuth0 } from '@auth0/auth0-react'

const Main = () => {
    const { loginWithRedirect } = useAuth0()

    return (
        <>
            <span className={'k-icon k-i-share'}></span>
            <h1 className={'k-drop-hint-line'}>mamako!</h1>
            <button onClick={() => loginWithRedirect()}>Hey!</button>
        </>
    )
}

export default hot(module)(Main)