var express = require('express')
var router = express.Router()
var moment = require('moment');
var q2m = require('query-to-mongo')
let UserModel = require('../../src/model/user')


let checkAuthorization = (req, res, next) => {
    if (req.session.userId) {
        UserModel.findOne({ _id: req.session.userId}, function(err, user) { 
        req.user=user
        console.log('checkAuthorization middleware - user', req.user)
        next(); 
      })
    } else {
        return res.status(401).send({ 
            message : "Not Authorized",
            status: res.statusCode
        }); 
    }
}

router.get('/', checkAuthorization, function (req, res) {
      UserModel.find({}).then(users => 
      res.json({reqUser: req.user, allUsers: users})
    )
   console.log('checkAuthorization print from next route', req.user)
})


router.route('/signup') // path: /users/signup
  .get((req, res, next) => {
    res.render('user_signup');
  })
  .post((req, res, next) => { 
      let newUser = new UserModel(); 
      newUser.name = req.body.name, 
      newUser.email = req.body.email 
      newUser.setPassword(req.body.password); // call setPassword function to hash password 
    
      // save newUser object to database 
      newUser.save((err, User) => { 
          if (err) { 
              return res.status(401).send({ 
                  err: err
              }); 
          } 
          else { 
              return res.status(200).send({ 
                  message : "User added succesfully."
              }); 
          } 
      }); 
  }); 

  router.route('/login') // path: /users/login
  .get((req, res, next) => {
    res.render('user_login');
  })
  .post((req, res, next) => { 
    // find user with requested email 
    UserModel.findOne({ email : req.body.email }, function(err, user) { 
        if (user === null) { 
            return res.status(401).send({ 
                message : "User not found.",
                status: res.statusCode
            }); 
        } 
        else { 
            if (user.validPassword(req.body.password)) { 
                req.session.userId = user._id
                req.session.name = user.name
                req.session.email = user.email
                return res.status(200).send({ 
                    message : "User Logged In", 
                    status: res.statusCode,
                    session: req.session
                }) 
            } 
            else { 
                return res.status(401).send({ 
                    message : "Wrong Password",
                    status: res.statusCode
                }); 
            } 
        } 
    }); 
  }); 


router.route('/session') // path: /users/ssession
  .get((req, res, next) => {
    let message = ''
    if (req.session.email) {
      message = 'Logged in'
    } else {
      message = 'Logged out'
    }
    res.json({
      "message": message, 
      "session": req.session
    });
  })

router.route('/logout')
  .get((req, res, next) => {
    req.session.destroy(function(err){
     // cannot access session here
   });
    res.json({
      "message": 'Session destroyed',
      "session": req.session
    });
  })
  

router.route('/:id') // path: /users/:id
  .get((req, res) => {
    UserModel.find({ _id: req.params.id })
    .then(user => { 
      res.send(user[0])
      // res.render('user_edit', {"user": user[0]} )
      }).catch(err => { 
        res.send(err)
      })
  })
  .put(function (req, res) {
    UserModel.findOneAndUpdate(
      { _id: req.params.id}, // search query 
      { 
        name: req.body.name
      },
      { new: true }) 
    .then(user => { 
      res.send(user)
    })
    .catch(err => { 
      res.send(err)
    })
  })
  .delete(function (req, res) {
    UserModel
    .findOneAndRemove({
      _id: req.params.id
    })
    .then(response => {
      res.send(response)
    })
    .catch(err => {
      res.send(err)
    })
  })


module.exports = router