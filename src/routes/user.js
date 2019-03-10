var express = require('express')
var router = express.Router()
var moment = require('moment');
var q2m = require('query-to-mongo')
let UserModel = require('../../src/model/user')



function hasAccessCheck(accessLevel) {
  return function(req, res, next) {
    if (req.session.user) {
      UserModel.findOne({ _id: req.session.userId}, function(err, user) { 
        if (user.hasAccess(accessLevel)) {
            req.user=user
            return next(); 
        } else {
            return req.flash('primary', 'Unauthorised access level. Only admin allowed.', '/users');
        }
      })
    } else {
      return req.flash('dark', 'Not Authorised. You must enter your username and password to log in.', '/users/login');
      // primary
      // secondary
      // success
      // danger
      // warning
      // info
      // light
      // dark

    }
  }
}



router.get('/access-user', 
  hasAccessCheck('user'), // protection middleware
  (req, res, next) => {
    console.log('you have USER access!')
    res.json({
      secure: true,
      data: 'user access granted'
    })
  }
)

router.get('/admin', 
  hasAccessCheck('admin'), // protection middleware
  (req, res, next) => {
    console.log('you have ADMIN access!')
    res.render('admin', {"user": req.user, "isAdmin": req.session.accessAdmin})
  }
)


let checkAuthorization = (req, res, next) => {
    if (req.session.userId) {
        UserModel.findOne({ _id: req.session.userId}, function(err, user) { 
        req.user=user
        console.log('checkAuthorization middleware - user', req.user)
        next(); 
      })
    } else {
      return req.flash('secondary', 'Not Authorised. You must enter your username and password to log in.', '/users/login');
        // return res.status(401).send({ 
        //     message : "Not Authorized",
        //     status: res.statusCode
        // }); 
    }
}

router.get('/all', function (req, res) {

      UserModel.find({}).then(users => 
      res.json({reqUser: req.user, allUsers: users})
    )
   console.log('checkAuthorization print from next route', req.user)
})


router.get('/', hasAccessCheck('user'), checkAuthorization, function (req, res) {

      UserModel.find({}).then(users => 
      res.render('user_details', {"user": req.user, "isAdmin": req.session.accessAdmin})
      // res.json({reqUser: req.user, allUsers: users})
    )
   console.log('checkAuthorization print from next route', req.user)
})


router.get('/signup', function (req, res) {
  res.render('user_signup');
})

router.post('/signup', function (req, res) {
      let newUser = new UserModel(); 
      newUser.name = req.body.name, 
      newUser.email = req.body.email,
      newUser.role = req.body.role
      newUser.setPassword(req.body.password); // call setPassword function to hash password 
    
    console.log('called setPassword')
      // save newUser object to database 
      newUser.save((err, user) => { 
          if (err) { 
              return res.status(401).send({ 
                  err: err
              }); 
          } 
          else { 
              return (
              res.status(200).send({ 
                  message : "User added succesfully.",
                  role: user
                })
              ); 
          } 
      }); 
})

  router.route('/login') // path: /users/login
  .get((req, res, next) => {
    if (req.session.user) {
      return res.redirect('/users')
    }
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
                req.session.user = user
                req.session.accessUser = user.hasAccess('user'),
                req.session.accessAdmin = user.hasAccess('admin')

                return res.redirect('/users')
                  // res.render('user_edit', {"user": user[0]} )
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
    return res.redirect('/users/login')
    // res.json({
    //   "message": 'Session destroyed',
    //   "session": req.session
    // });
  })
  

router.route('/profile/:id') // path: /users/:id
  .get((req, res) => {
    UserModel.find({ _id: req.params.id })
    .then(user => { 
      res.render('user_profile', {"user": user[0], "isAdmin": req.session.accessAdmin})
      }).catch(err => { 
        res.send(err)
      })
  })
  .post(function (req, res) {
    console.log('put action b4')

    if (req.body.name) {
      UserModel.findOneAndUpdate(
        { _id: req.params.id}, { name: req.body.name }, { new: true })
        .then(user => { 
         console.log('put action done')
         res.render('user_profile', {"user": user, "isAdmin": req.session.accessAdmin})
        })
        .catch(err => { 
          res.send(err)
        })
    } else if (req.body.oldPassword && req.body.newPassword && req.body.confirmPassword) {
      if (req.body.newPassword === req.body.confirmPassword) {
        console.log('sth')
      }
   }
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