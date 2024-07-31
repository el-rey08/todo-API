const express = require('express')
const { CreateContent, getOne, getAll, updateContent } = require('../controller/todoController')
const { authenticate } = require('../middleware/userAuth')
const { remove } = require('../controller/controller')
const router = express.Router()

router.post('/create-content',authenticate,CreateContent ),
router.get('/get-One-Content/:todoId', authenticate,getOne)
router.get('/get-All-Content', authenticate, getAll)
router.put('/update-content', updateContent)
router.delete('/delete-content', remove)
module.exports = router 