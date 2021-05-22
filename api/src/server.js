const WebSocket = require('ws')
const { decodeWsBuff } = require('../../common/wsbuff')

const { verifyToken, getProfile: getProfileFromToken } = require('./auth')

const BUFFER_MESSAGE_TYPES = {
    UPLOAD_ATTACHMENT: 0,
    ATTACHMENT_FOUND: 1
}

function jsonify(obj) {
    return JSON.stringify(obj)
}

function createAPIServer(wsServer = new WebSocket.Server(), apiDb) {
    var socketNonce = 0

    const sockets = new Map() // socket-id => socket
    const userSockets = new Map() // user-id => socket-id[]

    const activeProfiles = new Map() // user-id => profile

    const pendingUploads = new Map() // message-id => attachments[]

    const { listenToUploadEvent, emitUploadEvent } = (function (){
        const listeners = new Set()

        function listenToUploadEvent(listener) {
            listeners.add(listener)
        }

        function emitUploadEvent(event) {
            const listenerIterator = listeners.values()
            while (true) {
                const { done, value } = listenerIterator.next()

                if (done) {
                    break
                }

                value(event)
            }
        }

        return {
            listenToUploadEvent,
            emitUploadEvent
        }
    })();

    function handleBufferMessage(buffer, socketId, socket) {
        var message = decodeWsBuff(buffer)

        if (messageType === BUFFER_MESSAGE_TYPES.UPLOAD_ATTACHMENT) {
            let messageId = Buffer.from(message.fields[0]).toString()
            let attachmentId = Buffer.from(message.fields[1]).toString()
            let type = Buffer.from(message.fields[2]).toString()
            let attachment = Buffer.from(message.fields[2])

            chatPersister.attachChatAttachment(messageId, attachmentId, attachment, type)
        }
    }

    function handleApiCall(call, respond) {
        var action = call.action

        if (action === 'sync-profile') {
            if (activeProfiles.has(call.userId)) {
                respond({
                    data: {
                        action,
                        userId: call.userId,
                        profile: activeProfiles.get(call.userId)
                    }
                })
            } else {
                respond({
                    data: {
                        action: 'unauthenticated',
                        userId: call.userId
                    }
                })
            }
        } else if (action === 'authenticate') {
            verifyToken(call.authToken).then(function (result) {
                if (result) {
                    getProfileFromToken(call.authToken).then(function (rawProfile) {
                        apiDb.findOrCreateProfile(rawProfile).then(function (profile) {
                            var userId = profile.userId

                            activeProfiles.set(profile)

                            respond({
                                data: {
                                    action,
                                    userId,
                                    isAuthed: true,
                                    profile
                                }
                            })
                        }).catch(function (err) {
                            console.error('Profile creation error, ', err)
                            respond({
                                error: 'Profile creation error'
                            })
                        })
                    })
                } else {
                    respond({
                        data: {
                            action,
                            userId,
                            isAuthed: false
                        }
                    })
                }
            }).catch(function (err) {
                console.error('Authentication error, ', err)
                respond({
                    error: 'Authentication error'
                })
            })
        }
    }
    
    function handleJsonMessage(message, socketId, socket) {
        message = JSON.parse(message)
        var type = message.type

        if (type === 'api-call') {
            handleApiCall(message.call, function (response) {
                socket.send(jsonify({
                    type,
                    nonce: message.nonce,
                    response
                }))
            })
        }
    }

    wsServer.on('connection', function (socket) {
        var socketId = socketNonce++

        sockets.set(socketId, socket)

        socket.on('message', function (message) {
            if (ignoredSockets.has(socket)) {
                return
            }
            
            if (typeof message === 'string') {
                try {
                    handleJsonMessage(message, socketId, socket)
                } catch (e) {
                    console.error('Trouble handling json message, ', message, e)
                }
            } else {
                handleBufferMessage(message, socketId, socket)
            }
        })

        socket.on('error', function (err) {
            console.error(`Socket ${socketId} closed because of an error, `, err)
        })

        socket.on('close', function (reason) {
            console.error(`Socket ${socketId} closed because of reason ${reason === null || reason === undefined || reason === '' ? 'unknown' : reason}, `, err)
        })
    })

    return {}
}

exports.createAPIServer = createAPIServer