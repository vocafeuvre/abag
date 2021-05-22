import React from 'react'
import { Chat } from '@progress/kendo-react-conversational-ui'

const AttachmentTemplate = (props) => {
  let attachment = props.item
  return (
    <div className="k-card k-card-type-rich">
      <div className="k-card-body quoteCard">
        <img
          style={{
            maxHeight: "120px",
          }}
          src={attachment.content}
          draggable={false}
        />
      </div>
    </div>
  )
}

const fileUpload = React.createRef()

const ChatBox = props => {
  var chatChannel = props.chatChannel
  var apiClient = props.apiClient

  const [user, setUser] = React.useState({ id: chatChannel.getUser() })
  const [messages, setMessages] = React.useState([])

  var participantMap = new Map()

  function load() {
    var participants = chatChannel.getParticipants()  
    var pendingPromises = []
    for (let x = 0; x < participants.length; x++) {
      let participantId = participants[x]
  
      pendingPromises.push(apiClient.getUser(participantId).then(function (chatUser) {
        let participant = {
          id: chatUser._id,
          avatarUrl: chatUser.avatar,
          name: chatUser.givenName
        }

        participantMap.set(participantId, participant)
        if (participantId === user.id) {
          setUser(participant)
        }
      }).catch(function (err) {
        console.error('error in getting chat participants', err)
      }))
    }

    return Promise.all(pendingPromises)
  }

  React.useEffect(function () {
    var messageSubscriber = function (message) {
      let sender = participantMap.get(message.sender)

      setMessages([...messages, {
        author: {
          id: sender._id,
          avatarUrl: sender.avatar,
          name: sender.givenName
        },
        text: message.text,
        timestamp: new Date(message.timestamp),
        attachments: message.attachments.map(function (value) {
          return {
            content: value.url,
            contentType: value.contentType
          }
        })
      }])
    }

    load().then(function () {
      chatChannel.subscribeToMessages(messageSubscriber)
    })

    return function () {
      chatChannel.unsubscribeFromMessages(messageSubscriber)
    }
  }, [])

  const sendMessage = message => {
    message.timestamp = Date.now()

    chatChannel.sendMessage().then(function () {
      // TODO: for attachments, find their messages in state
      // and replace the data urls with proper ones
    })

    setMessages([...messages, { ...message, timestamp: new Date(message.timestamp) }])
  }

  const handleInputChange = (e) => {
    let file = e.target.files[0]
    let reader = new FileReader()

    reader.onloadend = (event) => {
      let message = {
        author: user,
        text: "",
        attachments: [
          {
            content: event.target ? event.target.result : "",
            contentType: "image",
          },
        ]
      }

      // it doesn't matter if there's no text and it's all attachments
      // the server accept them all the same
      sendMessage(message)
    }

    reader.readAsDataURL(file)
  }

  const uploadButton = props => {
    return (
      <>
        <input
          type="file"
          onChange={handleInputChange}
          style={{
            display: "none",
          }}
          ref={fileUpload}
        />
        <button
          className={"k-button k-flat k-button-icon"}
          onClick={() => fileUpload.current.click()}
        >
          <span
            className={"k-icon " + props.icon}
            style={{
              fontSize: "20px",
            }}
          />
        </button>
      </>
    )
  }

  const customMessage = (props) => {
    return (
      <>
        {props.sendButton}
        {props.messageInput}
        {uploadButton({
          icon: "k-i-image-insert",
        })}
      </>
    )
  }

  const handleMessageSend = evt => {
    sendMessage(evt.message)
  }

  return (
    <Chat
      messages={messages}
      user={user}
      onMessageSend={handleMessageSend}
      placeholder={"Type a message..."}
      messageBox={customMessage}
      attachmentTemplate={AttachmentTemplate}
    />
  )
}

export default ChatBox