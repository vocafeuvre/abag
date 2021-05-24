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
        jwt.verify(token, getKey, { algorithms: ['RS256'] }, function(err, decoded) {
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