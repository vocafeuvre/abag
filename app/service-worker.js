import settings from '../web-settings.json'

var socket, subscribeToSocket, subscribers

self.addEventListener('fetch', function (evt) {
    var request = evt.request

    if (request && request.url) {
        let url = new URL(request.url)
       
        if (url.hostname === settings.bucket_server && url.pathname === settings.bucket_image_endpoint) {
            var response = new Response()

            if (!socket) {
                socket = new WebSocket(settings.api_server)

                socket.addEventListener('open', function (evt) {
                    subscribers = new Map()

                    subscribeToSocket = function (eventName, subscriber) {
                        let subscribersByEvent = subscribers.get(eventName)

                        if (!subscribersByEvent) {
                            subscribersByEvent = []
                        }

                        subscribersByEvent.push(subscriber)
                        subscribers.set(eventName, subscribersByEvent)
                    }

                    socket.addEventListener('message', function (msgEvt) {
                        var message                        
                        try {
                            message = JSON.parse(msgEvt)
                        } catch (e) {
                            console.error('Error intercepting message from APIServer', e)
                        }
                    })
                })

                socket.addEventListener('error', function (evt) {
                    console.error('Error from APIServer', evt)
                })
            }

            return
        }
    }

    evt.respondWith(fetch(evt.request))
})

// we need to sync here with the APIServer
setTimeout(function () {
    if (!socket) {
        socket = new WebSocket(settings.api_server)

        socket.addEventListener('open', function (evt) {

            socket.addEventListener('message', function (evt) {

            })
        })

        socket.addEventListener('error', function (evt) {
            console.error('Error from APIServer', evt)
        })
    }
    
}, settings.db_sync_timeout)