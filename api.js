var express = require('express')
var router = express.Router()

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now())
  next()
})
// define the home page route
router.get('/', function (req, res) {
  res.send('Sub-route GET to /api')
})
// define the about route
router.post('/', function (req, res) {
  res.send('Sub-route POST to /api')
})

router.route('/books')
  .get(function (req, res) {
    res.send('Get all books')
  })
  .post(function (req, res) {
    res.send('Create a book')
  })

router.route('/books/:id')
  .get(function (req, res) {
    res.send(`Get a book with id: ${req.params.id}`)
  })
  .put(function (req, res) {
    res.send(`Edit a book with id: ${req.params.id}`)
  })
  .delete(function (req, res) {
    res.send(`Delete a book with id: ${req.params.id}`)
  })

module.exports = router

