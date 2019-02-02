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


router.post('/login', function (req, res) {
  users = {
    user1: { email: "admin@protege.sg", password: "Test1234", role: "admin" },
    user2: { email: "user@protege.sg", password: "Ab12345", role: "user"}
  }
  Object.keys(users).map(key => {
    let email = users[key].email
    let password = users[key].password
    if (req.body.email && req.body.password) {
      if (email === req.body.email && password === req.body.password) {
        res.json({email: req.body.email, password: req.body.password, token: "this is your token"})
      } else if (!(email === req.body.email && password === req.body.password)) {
        res.statusCode = 401
        res.json({error: "Invalid email or password!", statusCode: res.statusCode})
      }     
    } else {
        res.statusCode = 401
        res.json({error: "Please enter both email and password fields.", statusCode: res.statusCode })
    }
  })
})


router.route('/login')
  .get(function (req, res) {
    res.json({message: 'Secure/login'})

  })
  .post(function (req, res) {
    res.send('Secure/login')
  })




module.exports = router