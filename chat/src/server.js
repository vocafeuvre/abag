const WebSocket = require('ws')
const createUuid = require('../../common/fast-uuid')
const { encodeWsBuff, decodeWsBuff } = require('../../common/wsbuff')

const { verifyToken } = require('./auth')

const BUFFER_MESSAGE_TYPES = {
    UPLOAD_ATTACHMENT: 0,
    ATTACHMENT_FOUND: 1
}

const IGNORED_SOCKET_LIFETIME = 100 // in ms

function createChatMessage(chatId, text, sender, attachments) {
    return {
        chatId,
        text,
        sender,
        attachments
    }
}

function createChatServer(wsServer = new WebSocket.Server(), chatPersister) {
    var socketNonce = 0

    const sockets = new Map() // socket-id => socket
    const chatSubscribers = new Map() // chat-id => socket-id[]
    const userSockets = new Map() // user-id => socket-id[]

    const ignoredSockets = new WeakSet()

    const pendingAttachments = new Map() // message-id => attachments[]

    function handleBufferMessage(buffer, socketId, socket) {
        var message = decodeWsBuff(buffer)

        if (messageType === BUFFER_MESSAGE_TYPES.UPLOAD_ATTACHMENT) {
            let messageId = Buffer.from(message.fields[0]).toString()
            let attachmentId = Buffer.from(message.fields[1]).toString()
            let type = Buffer.from(message.fields[2]).toString()
            let attachment = Buffer.from(message.fields[2])

            let attachmentsByMessage = pendingAttachments.get(messageId)

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

    function handleJsonMessage(data, socketId, socket) {
        data = JSON.parse(data)
        var type = data.type

        if (type === 'send-message') {
            let chatId = data.chatId
            let subscribersByChat = chatSubscribers.get(chatId)

            if (!!subscribersByChat) {
                let attachments = data.attachments
                let chatMessage = createChatMessage(data.chatId, data.text, data.sender, attachments)
                let messageId = createUuid()

                let attachmentsByMessage = new Map()
                for (let x = 0; x < attachments.length; x++) {
                    let attachment = attachments[x]
                    let attachmentId = attachment.id = createUuid() // this adds the IDs to the attachments in chatMessage directly

                    attachmentsByMessage.set(attachmentId, attachment)
                }
                
                pendingAttachments.set(messageId, attachmentsByMessage)

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

                // TODO: try to catch errors in persisting and persist again (repeatedly) in those cases
                chatPersister.saveChatMessage(messageId, chatMessage)
            }
        } else if (type === 'get-attachment') { 
            let pendingAttachmentsByMessage = pendingAttachments.get(data.messageId)
            if (!!pendingAttachmentsByMessage && pendingAttachmentsByMessage.has(data.attachmentId)) {
                socket.send(JSON.stringify({
                    type: 'attachment-still-pending',
                    messageId: data.messageId,
                    attachmentId: data.attachmentId
                }))
                return
            }

            chatPersister.getChatAttachment(messageId, attachmentId).then(function (buffer) {
                socket.send(encodeWsBuff(BUFFER_MESSAGE_TYPES.ATTACHMENT_FOUND, Buffer.from(data.messageId).buffer, Buffer.from(data.attachmentId).buffer, buffer.buffer))
            }).catch(function () {
                socket.send(JSON.stringify({
                    type: 'attachment-not-found',
                    messageId: data.messageId,
                    attachmentId: data.attachmentId
                }))
            })
        } else if (type === 'subscribe-chat') {
            let subscribersByChat = chatSubscribers.get(data.chatId)

            if (!subscribersByChat) {
                subscribersByChat = new Set()
            }

            subscribersByChat.add(socketId)
            chatSubscribers.set(subscribersByChat)
        } else if (type === 'unsubscribe-chat') {
            let subscribersByChat = chatSubscribers.get(data.chatId)

            if (!!subscribersByChat) {
                subscribersByChat.add(socketId)

                if (subscribersByChat.size <= 0) {
                    chatSubscribers.delete(data.chatId)
                }
            }
        } else if (type === 'authenticate') {
            verifyToken(data.authToken).then(function (decoded) {
                if (!!decoded) {
                    let socketsByUser = userSockets.get(data.userId)
                    if (!socketsByUser) {
                        socketsByUser = new Set()
                    }

                    socketsByUser.add(socketId)
                    userSockets.set(data.userId, socketsByUser)
                } else {
                    socket.send(JSON.stringify({
                        type: 'unauthorized'
                    }))

                    ignoredSockets.add(socket)

                    setTimeout(function () {
                        socket.close()
                    }, IGNORED_SOCKET_LIFETIME)
                }
            }).catch(function (err) {
                console.log(err)

                socket.send(JSON.stringify({
                    type: 'auth-error'
                }))

                ignoredSockets.add(socket)

                setTimeout(function () {
                    socket.close()
                }, IGNORED_SOCKET_LIFETIME)
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

exports.createChatServer = createChatServer
