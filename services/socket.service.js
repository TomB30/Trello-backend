const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');

var gIo = null

function connectSockets(http, session) {
    gIo = require('socket.io')(http);
    gIo.on('connection', socket => {
        socket.on('disconnect', socket => {
        })
        socket.on('board changed', newBoardId => {
            if (socket.boardId === newBoardId) return;
            if (socket.boardId) {
                socket.leave(socket.boardId)
            }
            socket.boardId = newBoardId
            socket.join(socket.boardId)
        })
        socket.on('send card', card => {
            gIo.to(socket.boardId).emit('card updated', card)
        })
        socket.on('send groups', groups => {
            gIo.to(socket.boardId).emit('groups updated', groups)
        })
        socket.on('send title', title => {
            gIo.to(socket.boardId).emit('title updated', title)
        })
        socket.on('send style', style => {
            gIo.to(socket.boardId).emit('style updated', style)
        })
        socket.on('send members', members => {
            gIo.to(socket.boardId).emit('members updated', members)
        })
        socket.on('send activities', activities => {
            gIo.to(socket.boardId).emit('activities updated', activities)
        })

        socket.on('user-watch', userId => {
            if(socket.userId) socket.leave(socket.userId)
            socket.userId = userId
            socket.join(userId)
        })
        socket.on('send mention', mention =>{
            gIo.to(mention.userId).emit('mention updated', mention)
        })
        socket.on('unset-user-socket', () => {
            delete socket.userId
        })

    })
}

function emitTo({ type, data, label }) {
    if (label) gIo.to('watching:' + label).emit(type, data)
    else gIo.emit(type, data)
}

function emitToUser({ type, data, userId }) {
    logger.debug('Emiting to user socket: ' + userId)
    const socket = _getUserSocket(userId)
    if (socket) socket.emit(type, data)
    else {
        console.log('User socket not found');
        _printSockets();
    }
}

// Send to all sockets BUT not the current socket 
function broadcast({ type, data, room = null, userId }) {
    const excludedSocket = _getUserSocket(userId)
    if (!excludedSocket) {
        logger.debug('Shouldnt happen, socket not found')
        _printSockets();
        return;
    }
    logger.debug('broadcast to all but user: ', userId)
    if (room) {
        excludedSocket.broadcast.to(room).emit(type, data)
    } else {
        excludedSocket.broadcast.emit(type, data)
    }
}

function _getUserSocket(userId) {
    const sockets = _getAllSockets();
    const socket = sockets.find(s => s.userId == userId)
    return socket;
}
function _getAllSockets() {
    const socketIds = Object.keys(gIo.sockets.sockets)
    const sockets = socketIds.map(socketId => gIo.sockets.sockets[socketId])
    return sockets;
}

function _printSockets() {
    const sockets = _getAllSockets()
    console.log(`Sockets: (count: ${sockets.length}):`)
    sockets.forEach(_printSocket)
}
function _printSocket(socket) {
    console.log(`Socket - socketId: ${socket.id} userId: ${socket.userId}`)
}

module.exports = {
    connectSockets,
    emitTo,
    emitToUser,
    broadcast,
}



