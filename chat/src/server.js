const WebSocket = require('ws')
const createUuid = require('../../common/fast-uuid')
const { encodeWsBuff, decodeWsBuff } = require('../../common/wsbuff')

const { verifyToken } = require('./auth')

const BUFFER_MESSAGE_TYPES = {
    UPLOAD_ATTACHMENT: 0,
    ATTACHMENT_FOUND: 1
}

const IGNORED_SOCKET_LIFETIME = 100 // in ms

function createChatMessage(chatId, nonce, text, sender, attachments) {
    return {
        chatId,
        nonce,
        text,
        sender,
        attachments
    }
}

const CHAT_MESSAGE_LIMIT = 1000

function createChatServer(wsServer = new WebSocket.Server(), chatPersister) {
    var socketNonce = 0

    const sockets = new Map() // socket-id => socket
    const activeChats = new Map() // chat-id => chat-info
    const chatSubscribers = new Map() // chat-id => socket-id[]
    const userSockets = new Map() // user-id => socket-id[]

    const ignoredSockets = new WeakSet()

    const pendingAttachments = new Map() // message-id => attachments[]

    function handleRequest(request, respond, respondWithBuffer) {
        var action = request.action

        if (action === 'send-message') {
            let chatId = request.chatId
            let chatInfo = activeChats.get(chatId)
            if (!chatInfo) {
                respond({
                    error: 'Chat is not active.'
                })
                return
            }

            let attachments = request.attachments
            let chatMessage = createChatMessage(chatId, chatInfo.nonce++, request.text, request.sender, attachments)
            let messageId = createUuid()

            let attachmentsByMessage = new Map()
            for (let x = 0; x < attachments.length; x++) {
                let attachment = attachments[x]
                let attachmentId = attachment.id = createUuid() // this adds the IDs to the attachments in chatMessage directly

                attachmentsByMessage.set(attachmentId, attachment)
            }

            chatPersister.saveChatMessage(messageId, chatMessage)
                .then(function () {
                    pendingAttachments.set(messageId, attachmentsByMessage)

                    let subscribersByChat = chatSubscribers.get(chatId)
                    if (!!subscribersByChat) {
                        // broadcast to subscribers
                        let subscriberIterator = subscribersByChat.values()
                        while (true) {
                            const { done, value } = subscriberIterator.next()
        
                            if (done) {
                                break
                            }
        
                            let socket = sockets.get(value)
        
                            socket.send(JSON.stringify({
                                type: 'message-sent',
                                messageId,
                                ...chatMessage
                            }))
                        }
                    }

                    respond({
                        data: {
                            messageId
                        }
                    })
                }).catch(function (err) {
                    console.error('error in saving message to db, ', err)
                    respond({
                        error: 'Cannot save message to db.'
                    })
                })
        } else if (action === 'get-attachment') { 
            let pendingAttachmentsByMessage = pendingAttachments.get(request.messageId)
            if (!!pendingAttachmentsByMessage && pendingAttachmentsByMessage.has(request.attachmentId)) {
                respond({
                    error: 'Attachment is still pending.'
                })
                return
            }

            chatPersister.getChatAttachment(messageId, attachmentId).then(function (buffer) {
                respondWithBuffer(encodeWsBuff(BUFFER_MESSAGE_TYPES.ATTACHMENT_FOUND, Buffer.from(request.messageId).buffer, Buffer.from(request.attachmentId).buffer, buffer.buffer))
            }).catch(function (err) {
                console.error('error in getting attachment, ', err)
                respond({
                    error: 'Attachment is not found.'
                })
            })
        } else if (action === 'subscribe-chat') {
            let subscribersByChat = chatSubscribers.get(request.chatId)

            if (!subscribersByChat) {
                subscribersByChat = new Set()
            }

            subscribersByChat.add(socketId)
            chatSubscribers.set(subscribersByChat)
            respond({
                data: {
                    chatId
                }
            })
        } else if (action === 'unsubscribe-chat') {
            let subscribersByChat = chatSubscribers.get(request.chatId)

            if (!!subscribersByChat) {
                subscribersByChat.add(socketId)

                if (subscribersByChat.size <= 0) {
                    chatSubscribers.delete(request.chatId)
                }
            }

            respond({
                data: {
                    chatId
                }
            })
        } else if (action === 'get-chat-messages') {
            chatPersister.getChatMessages(request.chatId, CHAT_MESSAGE_LIMIT).then(function (messages) {
                respond({
                    data: {
                        chatId: request.chatId,
                        messages
                    }
                })
            })
        } else if (action === 'open-private-chat') { 
            let userId = request.userId

            if (userSockets.has(userId)) {
                let recipientId = request.recipientId
                chatPersister.getPrivateChatByUser(userId, recipientId)
                    .then(function (chatInfo) {
                        if (chatInfo) {
                            activeChats.set(chatInfo._id, chatInfo)
                            respond({
                                data: {
                                    userId,
                                    recipientId,
                                    chatInfo
                                }
                            })
                        } else {
                            chatPersister.createPrivateChat(userOne, userTwo).then(function (newChatInfo) {
                                activeChats.set(newChatInfo._id, newChatInfo)
                                respond({
                                    data: {
                                        userId,
                                        recipientId,
                                        chatInfo: newChatInfo
                                    }
                                })
                            }).catch(function (err) {
                                console.error('error in creating a chat, ', err)
                                respond({
                                    error: 'Cannot create private chat.'
                                })
                            })
                        }
                    }).catch(function (err) {
                        console.error('error in opening a chat, ', err)
                        respond({
                            error: 'Cannot open private chat.'
                        })
                    })
            } else {
                respond({
                    error: 'Unauthorized to open private chat.'
                })
            }
        } else if (action === 'authenticate') {
            verifyToken(request.authToken).then(function (decoded) {
                if (!!decoded) {
                    let socketsByUser = userSockets.get(request.userId)
                    if (!socketsByUser) {
                        socketsByUser = new Set()
                    }

                    socketsByUser.add(socketId)
                    userSockets.set(request.userId, socketsByUser)

                    respond({
                        data: {
                            userId: request.userId,
                        }
                    })
                } else {
                    respond({
                        error: 'Token is invalid.'
                    })

                    ignoredSockets.add(socket)

                    setTimeout(function () {
                        socket.close()
                    }, IGNORED_SOCKET_LIFETIME)
                }
            }).catch(function (err) {
                console.log(err)

                respond({
                    error: 'Cannot authenticate using token.'
                })

                ignoredSockets.add(socket)

                setTimeout(function () {
                    socket.close()
                }, IGNORED_SOCKET_LIFETIME)
            })
        }
    }

    function handleBufferMessage(buffer, socketId, socket) {
        var message = decodeWsBuff(buffer)

        if (messageType === BUFFER_MESSAGE_TYPES.UPLOAD_ATTACHMENT) {
            let messageId = Buffer.from(message.fields[0]).toString()
            let attachmentId = Buffer.from(message.fields[1]).toString()
            let type = Buffer.from(message.fields[2]).toString()
            let attachment = Buffer.from(message.fields[2])

            let attachmentsByMessage = pendingAttachments.get(messageId)

            // TODO: error prone
            if (attachmentsByMessage) {
                chatPersister.attachChatAttachment(messageId, attachmentId, attachment, type)
                    .then(function () {
                        attachmentsByMessage.delete(attachmentId)
                    })
                    .catch(function (err) {
                        console.error(err)
                    })
            }
        }
    }

    function handleJsonMessage(message, socketId, socket) {
        message = JSON.parse(message)
        var type = message.type

        if (type === 'request') [
            handleRequest(message.request, function (response) {
                socket.send(JSON.stringify(response))
            }, function (response) {
                socket.send(response)
            })
        ]
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

exports.createChatServer = createChatServer
