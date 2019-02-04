var express = require('express')
var router = express.Router()
var moment = require('moment');
var q2m = require('query-to-mongo')
var jwt = require('jsonwebtoken');
var users = require('../model/userData');

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")) // current timestamp
  console.log('Request Method: ', req.method) // log the request method 
  console.log('Path: ', `/api${req.path}`) // log the path 
  next()
})

// router.get('/', function (req, res) {
//   const authHeader = req.get('Authorization');
//   if (authHeader === undefined) {
//     res.statusCode = 403
//     res.json({ error: "No credentials sent!", statusCode:res.statusCode })
//   } else {
//     res.statusCode = 200
//     res.json({success: true, data: authHeader, statusCode:res.statusCode , headers:req.headers})
//   }
// })


//Check to make sure header is not undefined, if so, return Forbidden (403)
let checkToken = (req, res, next) => {
    const header = req.headers['authorization'];

    if(typeof header !== 'undefined') {
        const bearer = header.split(' ');
        const token = bearer[1];

        req.token = token;
        next();
    } else {
        //If header is undefined return Forbidden (403)
      res.statusCode = 403
      res.json({ error: "No credentials sent! Authorization header undefined.", statusCode:res.statusCode })
    }
}

    //This is a protected route 
    router.get('/', checkToken, (req, res) => {
        //verify the JWT token generated for the user
        jwt.verify(req.token, 'OURSECRET', (err, userData) => {
            if(err){
                //If error send Forbidden (403)
                console.log('ERROR: Could not connect to the protected route');
                res.statusCode = 403
                res.send({error: 'Credentials invalid!', statusCode: res.statusCode});
            } else {
                //If token is successfully verified, we can send the autorized data 
                res.json({
                    message: 'Successful log in',
                    userData, 
                    data: req.headers['authorization']
                });
                console.log('SUCCESS: Connected to protected route');
            }
        })
    })

router.post('/login', (req, res, next) => {
  let userData = {email: req.body.email, role: req.body.role }
  if (users[req.body.email] ) {
    if (users[req.body.email].password === req.body.password) {
      jwt.sign({ data: userData }, 'OURSECRET', { expiresIn: 120 },(err, token) => {
          if(err) { console.log(err) }    
          res.send({email: req.body.email, token: token, statusCode:res.statusCode });
      });
    } else {
      res.statusCode = 403
      res.send({error: "Wrong password", statusCode:res.statusCode});
    }
  } else  {
    res.statusCode = 403
    res.send({error: "Invalid email", statusCode:res.statusCode });
  } 
})






module.exports = router