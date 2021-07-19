const logger = require('../../services/logger.service')
// const userService = require('../user/user.service')
const socketService = require('../../services/socket.service')
const boardService = require('./board.service')

module.exports = {
    getBoards,
    removeBoard,
    addBoard,
    updateBoard,
}

async function getBoards(req, res) {
    try {
        const boards = await boardService.query(req.query)
        res.send(boards)
    } catch (err) {
        logger.error(`can't get boards`, err)
        res.status(500).send({ err: 'Failed to get boards' })
    }
}

async function removeBoard(req, res) {
    try {
        await boardService.remove(req.params.id)
        res.send({ msg: 'Deleted Successfully' })
    } catch (err) {
        logger.error('Failed to delete board', err)
        res.status(500).send({ err: 'Failed to delete board' })
    }
}

async function addBoard(req, res) {
    try {
        var { board } = req.body
        // board.byUserId = req.session.user._id
        board = await boardService.add(board)

        // prepare the updated board for sending out
        // var user = await userService.getById(board.byUserId)
        // Give the user credit for adding a board
        // user.score += 10;
        // user = await userService.update(user)
        // board.byUser = user
        // const fullUser = await userService.getById(user._id)

        // console.log('CTRL SessionId:', req.sessionID);
        // socketService.broadcast({type: 'board-added', data: board, userId: board.byUserId})
        // socketService.emitToUser({type: 'board-about-you', data: board, userId: board.aboutUserId})
        // socketService.emitTo({type: 'user-updated', data: fullUser, label: fullUser._id})

        res.send(board)

    } catch (err) {
        console.log(err)
        logger.error('Failed to add board', err)
        res.status(500).send({ err: 'Failed to add board' })
    }
}

async function updateBoard(req, res) {
    try {
        const { board } = req.body
        const savedBoard = await boardService.update(board)
        res.send(savedBoard)
    } catch (err) {
        logger.error('Failed to update board', err)
        res.status(500).send({ err: 'Failed to update board' })
    }
}