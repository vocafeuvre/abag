import { encodeWsBuff } from '../../../common/wsbuff'

function createChatClient(settings) {
    /** @type {WebSocket} */
    var socket

    var requestNoncer = 0
    var pendingRequests = new Map()

    var privateChats = new Map()
    var roomChats = new Map()

    var client = {}

    function handleResponse(nonce, response) {
        var pendingRequest = pendingRequests.get(nonce)
        if (response.error) {
            pendingRequest.reject(response.error)
        } else {
            pendingRequest.resolve(response.data)
        }
    }

    function makeRequest(message) {
        if (!socket) {
            throw new Error('Should load chatClient first.')
        }

        return new Promise(function (resolve, reject) {
            var requestNonce = requestNoncer++

            socket.send(JSON.stringify({
                type: 'request',
                nonce: requestNonce,
                call: message
            }))

            pendingRequests.set(requestNonce, { resolve, reject })
        })
    }

    function handleJsonMessage(message) {
        message = JSON.parse(message)
        var type = message.type

        if (type === 'request') {
            handleResponse(message.nonce, message.response)
        } else if (type === 'broadcast') {
            let data = null

            let action = message.data.action
            if (action === 'sent-message') {
                data = {
                    messageId: message.data.messageId,
                    nonce: message.data.nonce,
                    text: message.data.text,
                    attachments: message.data.attachments,
                    sender: message.data.sender,
                    timestamp: message.data.timestamp
                }
            }

            const privateChatIterator = privateChats.keys()
            while (true) {
                const { done, value } = privateChatIterator.next()

                if (done) {
                    break
                }

                let subscribers = value.subscribers
                for (let x = 0; x < value.subscribers.length; x++) {
                    subscribers[x](data)
                }
            }
        }
    }

    function load() {
        return new Promise(function (resolve, reject) {
            var socketOpened = false
            
            socket = new WebSocket(settings.chat_server)

            socket.addEventListener('open', function () {
                socketOpened = true

                socket.addEventListener('message', function (evt) {
                    var message = evt.data.message
                    
                    if (typeof message === 'string') {
                        try {
                            handleJsonMessage(message)
                        } catch (e) {
                            console.error('Trouble handling json message in ChatServer client, ', message, e)
                        }
                    } else {
                        handleBufferMessage(message)
                    }
                })

                resolve(client)
            })

            socket.addEventListener('error', function (evt) {
                if (socketOpened) {
                    console.error('ChatServer client socket error, ', evt)
                } else {
                    reject(evt)
                }
            })

            socket.addEventListener('close', function (evt) {
                console.log('ChatServer client is closing, ', evt)
            })
        })
    }

    function sendChatMessage(chatId, sender, text, attachments) {
        return makeRequest({
            action: 'send-message',
            chatId,
            sender,
            text,
            attachments,
            timestamp: Date.now()
        })
    }

    function openPrivateChat(userId, recipientId) {
        return makeRequest({
            action: 'open-private-chat',
            userId,
            recipientId
        }).then(function (data) {
            let chat = data.chat
            let subscribers = []

            privateChats.set(chat._id, {
                chat,
                subscribers
            })

            return {
                sendMessage: function (text, attachments, timestamp) {
                    return sendChatMessage(chat._id, userId, text, attachments, timestamp)
                },
                subscribeToMessages: function (subscriber) {
                    subscribers.push(subscriber)
                },
                unsubscribeFromMessages: function (subscriber) {
                    subscribers.splice(subscribers.indexOf(subscriber), 1)
                },
                getParticipants: function () {
                    return chat.participants
                },
                getUser: function () {
                    return userId
                }
            }
        }).catch(function (err) {
            console.error(err)
            return err
        })
    }

    function authenticate() {

    }

    client.load = load
    client.openPrivateChat = openPrivateChat

    return client
}

export default createChatClient