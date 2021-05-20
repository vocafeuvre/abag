function createAuther(store) {
    store.on("error", function(err) {
        console.error(err)
    })

    function checkIfAuthed(userId) {
        return new Promise(function (resolve, reject) {
            store.get(userId, function (err, token) {
                if (!!err) {
                    reject(err)
                    return
                }

                // if ever we have need of the token later, let's store it in memory
                if (!!token) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            })
        })
    }

    return {
        checkIfAuthed
    }
}

exports.createAuther = createAuther

const jwt = require('jsonwebtoken')
const jwksRsa = require('jwks-rsa')
const AuthenticationClient = require('auth0').AuthenticationClient

var client = jwksRsa({
    cache: true,
    jwksUri: 'https://vocafeuvre.au.auth0.com/.well-known/jwks.json'
})

var auth0 = new AuthenticationClient({
    domain: 'vocafeuvre.au.auth0.com',
    clientId: '{OPTIONAL_CLIENT_ID}'
})

function getKey(header, callback){
    client.getSigningKey(header.kid, function(err, key) {
        if (err) {
            console.error(err)
            callback(err)
            return
        }

        callback(null, key.publicKey || key.rsaPublicKey)
    })
}

function verifyToken(token) {
    return new Promise(function (resolve, reject) {
        jwt.verify(token, getKey, options, function(err, decoded) {
            if (err) {
                reject(err)
                return
            }

            resolve(decoded)
        })
    })
}

function getProfile(token) {
    return auth0.getProfile(token)
}

exports.verifyToken = verifyToken
exports.getProfile = getProfile