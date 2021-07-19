const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');

var gIo = null

function connectSockets(http, session) {
    gIo = require('socket.io')(http);
    gIo.on('connection', socket => {
        console.log('New socket', socket.id)
        socket.on('disconnect', socket => {
            console.log('Someone disconnected')
        })
        socket.on('board changed', newBoardId => {
            if (socket.boardId === newBoardId) return;
            if (socket.boardId) {
                socket.leave(socket.boardId)
            }
            socket.boardId = newBoardId
            socket.join(socket.boardId)
            console.log('socket.boardId',socket.boardId);
        })
        socket.on('send card', card => {
            console.log('card');
            // card = {card, cIdx , gIdx}
            // emits to all sockets:
            // gIo.emit('chat addMsg', msg)
            // emits only to sockets in the same room
            gIo.to(socket.boardId).emit('get card', card)
        })
        socket.on('send groups', groups => {
            console.log('groups');
            // group = {groups}
            // emits only to sockets in the same room
            gIo.to(socket.boardId).emit('get groups', groups)
        })
        socket.on('send title', title => {
            console.log('title');
            // emits only to sockets in the same room
            gIo.to(socket.boardId).emit('get title', title)
        })
        socket.on('send style', style => {
            console.log('style');
            // emits only to sockets in the same room
            gIo.to(socket.boardId).emit('get style', style)
        })
        socket.on('send members', members => {
            console.log('members');
            // emits only to sockets in the same room
            gIo.to(socket.boardId).emit('get members', members)
        })

        socket.on('user-watch', userId => {
            socket.join('watching:' + userId)
        })
        socket.on('set-user-socket', userId => {
            logger.debug(`Setting socket.userId = ${userId}`)
            socket.userId = userId
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



