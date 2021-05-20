const redis = require('redis')
const PouchDB = require('pouchdb')
const WebSocket = require('ws')

const { createChatServer } = require('./src/server')
const { wrapChatDb } = require('./src/persister')
const { createAuther } = require('./src/auth')

const settings = require('../settings.json')

const chatDb = wrapChatDb(
    new PouchDB(new URL('chats', settings.couchdb_url)),
    new PouchDB(new URL('chat-messages', settings.couchdb_url)),
)

const auther = createAuther(
    redis.createClient() // TODO: specify the location of redis here
)

createChatServer(
    new WebSocket.Server({
        port: 3579
    }),
    chatDb,
    auther
)