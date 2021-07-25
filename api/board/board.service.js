const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')
const logger = require('../../services/logger.service')


async function query(filterBy = {}) {
    try {
        // const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('board')
        const boards = await collection.find().toArray()
        // const boards = await collection.find(criteria).toArray()
        return boards
    } catch (err) {
        logger.error('cannot find boards', err)
        throw err
    }

}

async function remove(boardId) {
    try {
        // const store = asyncLocalStorage.getStore()
        // const { userId, isAdmin } = store
        const collection = await dbService.getCollection('board')
        // remove only if user is owner/admin
        // const query = { _id: ObjectId(boardId) }
        // if (!isAdmin) query.byUserId = ObjectId(userId)
        // await collection.deleteOne(query)
        await collection.deleteOne({ '_id': ObjectId(boardId) })

    } catch (err) {
        logger.error(`cannot remove board ${boardId}`, err)
        throw err
    }
}


async function add(board) {
    try {
        const boardToAdd = board;
        // boardToAdd.createdBy = ObjectId()
        const collection = await dbService.getCollection('board')
        await collection.insertOne(boardToAdd)
        return boardToAdd;
    } catch (err) {
        logger.error('cannot insert board', err)
        throw err
    }
}

async function update(board){
    try{
        const collection = await dbService.getCollection('board')
        boardToSave = board
        boardToSave._id = ObjectId(board._id)
        const savedBoard = await collection.updateOne({ '_id': ObjectId(board._id) }, { $set: board }) // need to check _______________________________________ //
        return board
    } catch(err) {
        logger.error(`can not update board` , err)
    }
}

// function _buildCriteria(filterBy) {
//     const criteria = {}
//     return criteria
// }

module.exports = {
    query,
    remove,
    add,
    update,
}
