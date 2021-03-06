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
        console.log('api-call', call)

        if (action === 'get-user') {
            apiDb.getUser(call.userId).then(function (user) {
                if (doc) {
                    respond({
                        data: {
                            user
                        }
                    })
                } else {
                    respond({
                        error: 'User not found.'
                    })
                }
            }).catch(function (err) {
                console.error(err)
                respond({
                    error: 'Unable to get user.'
                })
            })
        } else if (action === 'update-user') {
            apiDb.updateUser(call.user).then(function (resp) {
                if (resp) {
                    respond({
                        data: {
                            user: resp
                        }
                    })
                } else {
                    respond({
                        error: 'Unable to update user.'
                    })
                }
            }).catch(function (err) {
                respond({
                    error: err
                })
            })
        } else if (action === 'sync-profile') {
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
        } else if (action === 'get-drives') {
            apiDb.getDrives(call.sortType, call.searchKey).then(function (drives) {
                respond({
                    data: {
                        action,
                        drives
                    }
                })
            }).catch(function (err) {
                respond({
                    error: err
                })
            })
        } else if (action === 'create-drive') {
            apiDb.createDrive(call.drive, call.organizer).then(function (drive) {
                if (drive) {
                    respond({
                        data: {
                            drive
                        }
                    })
                } else {
                    respond({
                        error: 'Unable to save to drive to db.'
                    })
                }
            }).catch(function (err) {
                respond({
                    error: err
                })
            })
        } else if (action === 'get-drives-by-organizer') {
            apiDb.getDrivesByOrganizer(call.organizerId).then(function (drives) {
                respond({
                    data: {
                        organizerId,
                        drives
                    }
                })
            }).catch(function (err) {
                respond({
                    error: err
                })
            })

            sendVolunteerRequest
            sendDonationAttempt

        } else if (action === 'update-drive-seen-count') {
            apiDb.updateDriveSeenCount(call.driveId, call.seenCount).then(function (resp) {
                if (resp) {
                    respond({
                        data: {
                            driveId: resp._id,
                            seenCount: resp.seenCount
                        }
                    })
                } else {
                    respond({
                        error: 'Unable to update seen count.'
                    })
                }
            }).catch(function (err) {
                respond({
                    error: err
                })
            })
        } else if (action === 'send-volunteer-request') {
            apiDb.sendVolunteerRequest(call.driveId, call.volunteerRequest).then(function (resp) {
                if (resp) {
                    respond({
                        data: {
                            drive: resp
                        }
                    })
                } else {
                    respond({
                        error: 'Unable to save volunteer request.'
                    })
                }
            }).catch(function (err) {
                respond({
                    error: err
                })
            })
        } else if (action === 'send-donation-attempt') {
            apiDb.sendDonationAttempt(call.driveId, call.donation).then(function (resp) {
                if (resp) {
                    respond({
                        data: {
                            drive: resp
                        }
                    })
                } else {
                    respond({
                        error: 'Unable to save donation attempt.'
                    })
                }
            }).catch(function (err) {
                respond({
                    error: err
                })
            })
        } else if (action === 'authenticate') {
            verifyToken(call.authToken).then(function (result) {
                if (result) {
                    getProfileFromToken(call.authToken).then(function (rawProfile) {
                        apiDb.findOrCreateUser(rawProfile).then(function (profile) {
                            activeProfiles.set(profile)

                            respond({
                                data: {
                                    action,
                                    userId: profile.id,
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
                    }).catch(function (err) {
                        console.error('Profile getting error, ', err)
                        respond({
                            error: 'Profile getting error'
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
                console.log('api-return', response)
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
        console.log('Socket incoming, numbered ' + socketId + ' and saved')

        socket.on('message', function (message) {
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
            console.error(`Socket ${socketId} closed because of reason ${reason === null || reason === undefined || reason === '' ? 'unknown' : reason}, `)
        })
    })

    return {}
}

exports.createAPIServer = createAPIServer