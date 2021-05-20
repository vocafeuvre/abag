const PouchDB = require('pouchdb')
const createUuid = require('../common/fast-uuid')

const CHAT_MESSAGE_INDEX = 'chat-message'

function wrapChatDb(chatDb = new PouchDB(), chatMessageDb = new PouchDB()) {

    function createPrivateChat(userOne, userTwo) {
        return chatDb.put({
            _id: createUuid(),
            type: 'private',
            participants: [userOne, userTwo],
            nonce: 0
        }).then(function (response) {
            return response
        }).catch(function (err) {
            console.error(err)
        })
    }

    // after creating the room chat, you should pass the room chat id
    // to the drive object so that it knows its room chat
    function createRoomChat(users) {
        return chatDb.put({
            _id: createUuid(),
            type: 'room',
            participants: users,
            nonce: 0
        }).then(function (response) {
            return response
        }).catch(function (err) {
            console.error(err)
        })
    }

    function getPrivateChatByUser(userOne, userTwo) {
        return chatDb.find({
            selector: {
                type: 'private',
                participants: {
                    $all: [userOne, userTwo]
                }
            }
        }).then(function (response) {
            if (!!response.docs.length) {
                return response.docs[0]
            }
        }).catch(function (err) {
            console.error(err)
            return false
        })
    }

    function getChat(id) {
        return chatDb.get(id).then(function (response) {
            if (!!response.docs.length) {
                return response.docs[0]
            }
        }).catch(function (err) {
            console.error(err)
            return false
        })
    }

    function getChatMessages(id, limit) {
        return chatMessageDb.find({
            selector: {
                chatId: id
            },
            limit,
            sort: [{ nonce: 'desc' }],
            use_index: CHAT_MESSAGE_INDEX
        }).catch(function (err) {
            console.error(err)
            return false
        })
    }

    function saveChatMessage(id, message) {
        return chatMessageDb.put({
            _id: id,
            ...message
        }).then(function (response) {
            return response
        }).catch(function (err) {
            console.error(err)
            return false
        })
    }

    function attachChatAttachment(messageId, attachmentId, buffer, type) {
        return chatMessageDb.putAttachment(messageId, attachmentId, buffer, type).then(function (response) {
            return response
        }).catch(function (err) {
            console.error(err)
            return false
        })
    }

    function getChatAttachment(messageId, attachmentId) {
        return chatMessageDb.getAttachment(messageId, attachmentId).then(function (buffer) {
            return buffer
        }).catch(function (err) {
            console.error(err)
            return false
        })
    }

    return {
        createPrivateChat,
        createRoomChat,
        getChat,
        getPrivateChatByUser,
        getChatMessages,
        saveChatMessage,
        attachChatAttachment,
        getChatAttachment,
    }
}

exports.wrapChatDb = wrapChatDb