import { encodeWsBuff } from '../../../common/wsbuff'

function createApiClient(settings) {
    /** @type {WebSocket} */
    var socket

    var apiCallNoncer = 0
    var pendingApiCalls = new Map()

    var client = {}

    function handleApiCallResponse(nonce, response) {
        var pendingApiCall = pendingApiCalls.get(nonce)
        if (response.error) {
            pendingApiCall.reject(response.error)
        } else {
            pendingApiCall.resolve(response.data)
        }
    }

    function makeApiCall(message) {
        if (!socket) {
            throw new Error('Should load apiClient first.')
        }

        return new Promise(function (resolve, reject) {
            var apiCallNonce = apiCallNoncer++

            socket.send(JSON.stringify({
                type: 'api-call',
                nonce: apiCallNonce,
                call: message
            }))

            pendingApiCalls.set(apiCallNonce, { resolve, reject })
        })
    }
   
    function handleBufferMessage(message) {
        // TODO
    }

    function handleJsonMessage(message) {
        message = JSON.parse(message)
        var type = message.type

        if (type === 'api-call') {
            handleApiCallResponse(message.nonce, message.response)
        }
        // TODO: might we need a broadcast type here?
    }

    function load() {
        return new Promise(function (resolve, reject) {
            var socketOpened = false
            
            socket = new WebSocket(settings.api_server)

            socket.addEventListener('open', function () {
                socketOpened = true

                socket.addEventListener('message', function (evt) {
                    var message = evt.data.message
                    
                    if (typeof message === 'string') {
                        try {
                            handleJsonMessage(message)
                        } catch (e) {
                            console.error('Trouble handling json message in APIServer client, ', message, e)
                        }
                    } else {
                        handleBufferMessage(message)
                    }
                })

                resolve(client)
            })

            socket.addEventListener('error', function (evt) {
                if (socketOpened) {
                    console.error('APIServer client socket error, ', evt)
                } else {
                    reject(evt)
                }
            })

            socket.addEventListener('close', function (evt) {
                console.log('APIServer client is closing, ', evt)
            })
        })
    }

    function authenticate() {

    }

    client.load = load

    return client
}

export default createApiClient