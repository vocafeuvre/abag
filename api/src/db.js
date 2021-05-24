const PouchDB = require('pouchdb')
const createUuid = require('../../common/fast-uuid')
const moment = require('moment')

function makeApiDb(profileDb, driveDb) {
    function getUser(userId) {
        return profileDb.get(userId).then(function (doc) {
            return response
        }).catch(function (err) {
            console.error(err)
            return false
        })
    }

    function updateUser(user) {
        return profileDb.get(user._id).then(function (userDoc) {
            if (userDoc) {
                userDoc.email = !user.email ? userDoc.email || null : user.email,
                userDoc.bio = !user.bio ? userDoc.bio || null : user.bio,
                userDoc.givenName = !user.givenName ? user.givenName || null : user.givenName,
                userDoc.lastName = !user.lastName ? user.lastName || null : user.lastName,
                userDoc.contactNumber = !user.contactNumber ? user.contactNumber || null : user.contactNumber,
                userDoc.address = !user.address ? userDoc.address || null : user.address,
                userDoc.city = user.city ? !userDoc.city || null : user.city,
                userDoc.province = !user.province ? userDoc.province || null : user.province,
                userDoc.zipCode = !user.zipCode ? userDoc.zipCode || null : user.zipCode,
                userDoc.country = !user.country ? userDoc.country || null : user.country

                return profileDb.put(userDoc)
            }
            
            return false
        }).catch(function (err) {
            console.error(err)
            return Promise.reject(err)
        })
    }

    function findOrCreateUser(user) {
        if (!user.email) {
            return Promise.reject('No email field in raw profile.')
        }

        return profileDb.find({
            selector: {
                email: user.email
            }
        }).then(function (userDocs) {
            var userDoc = userDocs[0]
            if (!userDoc || !userDoc._id) {
                userDoc = {
                    _id: createUuid()
                }
            }

            userDoc.email = !user.email ? userDoc.email || null : user.email
            userDoc.avatar = !user.picture ? userDoc.avatar || null : user.picture
            userDoc.givenName = !user.given_name ? userDoc.givenName || null : user.given_name
            userDoc.lastName = !user.last_name ? userDoc.lastName || null : user.last_name
            userDoc.contactNumber = !user.email ? userDoc.contactNumber || null : user.contactNumber
            userDoc.address = !user.address ? userDoc.address || null : user.address
            userDoc.gender = !user.gender ? userDoc.gender || null : user.gender

            return profileDb.put(userDoc).then(function () {
                return userDoc
            })
        }).catch(function (err) {
            console.error(err)
            return Promise.reject(err)
        })
    }

    const driveSorts = {
        'recent': { dateAdded: 'desc' },
        'popular': { seenCount: 'desc' }
    }
    
    function getDrives(sortType, searchKey) {
        var sortObj = driveSorts[sortType]

        var sortArr = []
        if (sortObj) {
            sortArr = [sortObj]
        }

        var selector = {}
        if (searchKey && typeof searchKey === 'string') {
            let searchKeys = searchKey.slice(0, 100).split(/\s+/g)
            let searchRegex = '/('

            for (let x = 0; x < searchKeys.length; x++) {
                if (x === 0) {
                    searchRegex += searchRegex
                } else {
                    searchRegex += ('|' + searchRegex)
                }
            }

            searchRegex + ')+/g'

            selector.title = {
                '$regex': searchRegex
            }

            selector.description = {
                '$regex': searchRegex
            }
        }

        return driveDb.find({
            selector,
            sort: sortArr
        }).then(function (drives) {
            return drives
        }).catch(function (err) {
            console.error(err)
            return Promise.reject(err)
        })
    }

    function getDrivesByOrganizer(organizerId) {
        return driveDb.find({
            organizer: organizerId
        }).catch(function (err) {
            console.error(err)
            return Promise.reject(err)
        })
    }

    function createDrive(drive, organizer) {
        return driveDb.put({
            _id: createUuid(),
            ...drive,
            seenCount: 0,
            organizer: organizer._id,
            dateAdded: Date.now(),
            dateModified: Date.now()
        }).catch(function (err) {
            console.error(err)
            return Promise.reject(err)
        })
    }

    // TODO: only if the DriveOrganizer is done
    function updateDrive(drive) {
        return driveDb.get(drive._id).then(function (driveDoc) {
            if (driveDoc) {
                return driveDb.put(driveDoc)
            }

            return false
        }).catch(function (err) {
            console.error(err)
            return Promise.reject(err)
        })
    }

    function updateDriveSeenCount(driveId, seenCount) {
        return driveDb.get(driveId).then(function (driveDoc) {
            if (driveDoc) {
                driveDoc.seenCount += seenCount
                driveDoc.dateModified = Date.now()

                return driveDb.put(driveDoc)
            }

            return false
        }).catch(function (err) {
            console.error(err)
            return Promise.reject(err)
        })
    }

    function sendVolunteerRequest(driveId, request) {
        return driveDb.get(driveId).then(function (driveDoc) {
            if (driveDoc) {
                if (!driveDoc.volunteers) {
                    driveDoc.volunteers = []
                }

                driveDoc.volunteers.push({
                    volunteerId: request.volunteerId,
                    schedule: Array.isArray(request.schedule) ? [
                        ...request.schedule.filter(value => {
                            return moment.isDate(value.date) && 
                                moment(value.date).isSameOrAfter(moment().startOf('day'))
                        })
                    ] : [],
                    skills: [
                        ...request.skills
                    ],
                    message: request.message
                })
                driveDoc.dateModified = Date.now()

                return driveDb.put(driveDoc)
            }

            return false
        }).catch(function (err) {
            console.error(err)
            return Promise.reject(err)
        })
    }

    function sendDonationAttempt(driveId, donation, donorId, attachment, attachmentType) {
        return driveDb.get(driveId).then(function (driveDoc) {
            if (driveDoc) {
                if (!driveDoc.donations) {
                    driveDoc.donations = []
                }

                var donationId = createUuid()

                driveDb.putAttachment(driveId, donationId, attachment, attachmentType).then(function () {
                    driveDoc.donations.push({
                        donationId: createUuid(),
                        donorId,
                        currency: donation.currency,
                        amount: donation.amount,
                        description: donation.description
                    })
    
                    driveDoc.dateModified = Date.now()
    
                    return driveDb.put(driveDoc).catch(function (err) {
                        console.error(err)
                        return Promise.reject(err)
                    })
                }).catch(function (err) {
                    console.error(err)
                    return Promise.reject(err)
                })
            }

            return false
        }).catch(function (err) {
            console.error(err)
            return Promise.reject(err)
        })
    }

    return {
        getUser,
        updateUser,
        getDrives,
        getDrivesByOrganizer,
        createDrive,
        updateDriveSeenCount,
        sendVolunteerRequest,
        sendDonationAttempt,
        findOrCreateUser
    }
}

exports.makeApiDb = makeApiDb