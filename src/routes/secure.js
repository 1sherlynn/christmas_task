var express = require('express')
var router = express.Router()
var moment = require('moment');
var q2m = require('query-to-mongo')

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")) // current timestamp
  console.log('Request Method: ', req.method) // log the request method 
  console.log('Path: ', `/api${req.path}`) // log the path 
  next()
})

router.get('/', function (req, res) {
  const authHeader = req.get('Authorization');
  if (authHeader === undefined) {
    res.statusCode = 403
    res.json({ error: "No credentials sent!", statusCode:res.statusCode })
  } else {
    res.statusCode = 200
    res.json({success: true, data: authHeader, statusCode:res.statusCode , headers:req.headers})
  }
})


router.post('/', function (req, res) {
  res.send('Secure route')
})


router.route('/login')
  .get(function (req, res) {
    res.json({message: 'Secure/login'})

  })
  .post(function (req, res) {
    res.send('Secure/login')
  })




module.exports = router