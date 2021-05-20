const WebSocket = require('ws')
const createUuid = require('../../common/fast-uuid')
const { encodeWsBuff, decodeWsBuff } = require('../../common/wsbuff')

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

    function handleJsonMessage(data, socketId, socket) {
        data = JSON.parse(data)
        var type = data.type

        if (type === 'get-drives') {

        } else if (type === 'send-donation') {

        } else if (type === 'send-volunteer-request') {

        } else if (type === 'sync-profile') {
            if (activeProfiles.has(data.userId)) {
                socket.send(jsonify({
                    nonce: data.nonce,
                    type: 'profile-synced',
                    userId: data.userId,
                    profile: activeProfiles.get(data.userId)
                }))
            } else {
                socket.send(jsonify({
                    nonce: data.nonce,
                    type: 'unauthenticated',
                    userId: data.userId
                }))
            }
        } else if (type === 'authenticate') {
            verifyToken(data.authToken).then(function (result) {
                if (result) {
                    getProfileFromToken(data.authToken).then(function (rawProfile) {
                        apiDb.findOrCreateProfile(rawProfile).then(function (profile) {
                            var userId = profile.userId

                            activeProfiles.set(profile)

                            socket.send(jsonify({
                                nonce: data.nonce,
                                type: 'authenticated',
                                userId
                            }))
                        }).catch(function (err) {
                            console.error('Profile creation error, ', err)
                            socket.send(jsonify({
                                nonce: data.nonce,
                                type: 'profile-creation-error'
                            }))
                        })
                    })
                } else {
                    socket.send(jsonify({
                        nonce: data.nonce,
                        type: 'unauthenticated'
                    }))
                }
            }).catch(function (err) {
                console.error('Authentication error, ', err)
                socket.send(jsonify({
                    nonce: data.nonce,
                    type: 'auth-error'
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