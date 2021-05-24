const PouchDB = require('pouchdb')
const PouchDBFind = require('pouchdb-find')
const WebSocket = require('ws')

const { createAPIServer } = require('./src/server')
const { makeApiDb } = require('./src/db')

const settings = require('../settings.json')

PouchDB.plugin(PouchDBFind)

const apiDb = makeApiDb(
    new PouchDB(new URL('profiles', settings.couchdb_url).href),
    new PouchDB(new URL('drives', settings.couchdb_url).href),
)

createAPIServer(
    new WebSocket.Server({
        port: 8080
    }),
    apiDb
)