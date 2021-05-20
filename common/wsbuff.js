/**
 * Field in a WsBuff message.
 * 
 * @typedef WsBuffMessageField
 * @property {number} start - Starting index of the field in the raw message buffer.
 * @property {number} end - Ending index of the field in the raw message buffer.
 * @property {ArrayBuffer} data - Data of the field.
 */

/**
 * Message from a WsBuff node.
 * 
 * @typedef WsBuffMessage
 * @property {number} action - Action of this WsBuff message
 * @property {ArrayBuffer} data - Raw buffer data of this WsBuff message
 * @property {WsBuffMessageField[]} fields - Fields contained in this WsBuff message
 */


/** Indicator of a WsBuff message. Uint8 representation of "$". */
const MESSAGE_INDICATOR = [36]

/** Length of the field length, in bytes. */
const FIELD_LENGTH_BYTES = 4

/**
 * Encodes a WsBuff message from a set of fields.
 * 
 * @param {number} action - Action of the message.
 * @param {ArrayBuffer[]} fields - Fields of the message to be sent.
 */
function encodeWsBuff(action, ...fields) {
    // 1 here is the action flag
    const message_length = MESSAGE_INDICATOR.length + 1 + (FIELD_LENGTH_BYTES * fields.length) + fields.reduce(function (accum, curr) { return accum + curr.byteLength }, 0)
    const message_buffer = new ArrayBuffer(message_length)
    const message_array = new Uint8Array(message_buffer)
    const message_view = new DataView(message_buffer)

    // write the message header
    message_view.setUint8(0, MESSAGE_INDICATOR[0])
    message_view.setUint8(1, action)

    // write the fields
    var written_byte_count = 1 + MESSAGE_INDICATOR.length
    for (let x = 0; x < fields.length; x++) {
        const field_length = fields[x].byteLength

        if (field_length > 0xFFFFFFFF) {
            throw new Error("Field length should be smaller than 4,294,967,295 bytes")
        }

        // write the fields onto the buffer
        message_view.setUint32(written_byte_count, field_length)
        written_byte_count += FIELD_LENGTH_BYTES // only 4 bytes allowed for fieldLength
        message_array.set(new Uint8Array(fields[x]), written_byte_count)
        written_byte_count += fields[x].byteLength
    }

    return message_buffer
}

/**
 * Checks if message is a WsBuff message.
 * 
 * @param {ArrayBuffer} message - Buffer with the indicator.
 */
function isWsBuff(message) {
    const view = new DataView(message)

    return message.byteLength > MESSAGE_INDICATOR.length && MESSAGE_INDICATOR[0] === view.getUint8(0)
}

/**
 * Decodes a WsBuff message.
 * 
 * @param {ArrayBuffer} message - Message to be decoded.
 * 
 * @returns {WsBuffMessage}
 */
function decodeWsBuff(message) {
    const is_valid = isWsBuff(message)

    if (is_valid) {
        const view = new DataView(message)
        
        const action = view.getUint8(MESSAGE_INDICATOR.length)

        // slice the message into its different fields
        const fields = []
        let offset = MESSAGE_INDICATOR.length + 1
        while (offset < message.byteLength) {
            let field_length = view.getUint32(offset)
            offset += FIELD_LENGTH_BYTES
            fields.push({
                start: offset,
                end: field_length + offset,
                data: message.slice(offset, field_length + offset)
            })
            offset += field_length
        }

        return {
            action,
            message,
            fields
        }
    }
}

module.exports = {
    encodeWsBuff,
    isWsBuff,
    decodeWsBuff
}