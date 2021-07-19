const express = require('express')
const { requireAuth } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { addBoard, getBoards, updateBoard, removeBoard } = require('./board.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getBoards)
// router.post('/', requireAuth, addBoard) // !!!!!
router.post('/', addBoard)
// router.put('/', requireAuth, updateBoard) // !!!!!
router.put('/', updateBoard)
router.delete('/:id', requireAuth, removeBoard)

module.exports = router