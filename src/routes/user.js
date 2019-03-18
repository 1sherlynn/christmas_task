var express = require('express')
var router = express.Router()
var multer  = require('multer')
var moment = require('moment');
var q2m = require('query-to-mongo')
let UserModel = require('../../src/model/user')
let validate = require("validate.js-express") 
const path = require('path')
const sharp = require('sharp');
const fs = require('fs')
var PromiseFtp = require('promise-ftp');
sharp.cache(false);

var storage = multer.diskStorage({
  destination: 'public/uploads/userimage/' ,
  filename: function (req, file, cb) {
    cb(null,  'userimage_' + req.params.id + path.extname(file.originalname))
  }
})

var upload = multer({ storage: storage }).single('avatar')

let constraints = {
    newPassword: {
        presence: true,
        length: {
            minimum: 6,
            message: "must be at least 6 characters"
        }
    },
    oldPassword: {
      presence: true
    }
}

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
            return (
              res.status(401).send({ 
                  message : "User not found.",
                  status: res.statusCode
              })
            )
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
                  console.log('checked invalid password')
                  return res.status(401).send({ message : "Wrong Password", status: res.statusCode})
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


router.post('/profile-image/:id', (req, res) => {
    upload(req, res, (err) => {
      if (err) {
        res.render('user_profile', {image_error: err})
      } else {
        let avatar = req.file.path.substring(6, 1000);
        let image = req.file.path

          const imagePath = path.join(__dirname + '../../../public/uploads/userimage/userimage_5c83e3ab8bcaf10017d70fb4.png');
          const outputImageName = req.file.filename;
          const outputImagePath = path.join(__dirname + '../../../public/uploads/userimagethumb/'+ outputImageName);
          const ftpFileName = Date.now().toString().slice(0,9)+req.file.filename
           // const ftpFileName = req.file.filename+"?v="+Date.now()
          console.log('FTP FILE NAME 1', ftpFileName)
          const ftpImageUrl = "https://media.owlgo.co/source/sherlynn/"+ftpFileName
           
          sharp(imagePath).resize(200,200, { fit: "inside" }).toFile(outputImagePath, function(err) {
            if (err) {
              throw err;
            } else {
            let avatarThumb = avatar.slice(0, 18) + 'thumb' + avatar.slice(18)
            fs.unlink(imagePath, (err) => {
              if (err) {
                console.error(err)
                return
              }
            })
            console.log('FTP FILE NAME 2', ftpFileName)
              var ftp = new PromiseFtp();
              ftp.connect({host: process.env.FTP_HOST, user: process.env.FTP_USERNAME, password: process.env.FTP_PASSWORD})
              .then(function (serverMessage) {
                console.log('ftp connected', serverMessage)
                console.log('FTP FILE NAME 3', ftpFileName)
                return ftp.put(outputImagePath, ftpFileName);
              }).then(function () {
                console.log('ftp upload success')
                console.log('FTP FILE NAME 4', ftpFileName)
                return ftp.end();
              });
            
              UserModel.findOneAndUpdate({ _id: req.params.id}, { avatar: ftpImageUrl }, { new: true })
              .then(user => { 
                  return req.flash('success', "Image successfully changed", '/users/profile/'+req.params.id); 
                  // return res.redirect('/users/profile/'+req.params.id)
              })
              .catch(err => { 
                res.send(err)
              })
            }

          })
      }
    })
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
    if (req.body.name) {
      UserModel.findOneAndUpdate(
        { _id: req.params.id}, { name: req.body.name }, { new: true })
        .then(user => { 
         console.log('put action done')
         
         return res.redirect('/users/profile/'+req.params.id)
         // res.render('user_profile', {"user": user, "isAdmin": req.session.accessAdmin})
        })
        .catch(err => { 
          res.send(err)
        })
    } else if (req.body.oldPassword && req.body.oldPassword && req.body.oldPassword) {

        UserModel.findOne({ _id: req.params.id}, function(err, user) { 
          if (user === null) { 
            console.log('user invalid')
            return ( res.status(401).send({ 
                  message : "User not found.",
                  status: res.statusCode
              })
            )
          } 
          else { 
              if (user.validPassword(req.body.oldPassword)) { 
                console.log('valid password')
                 UserModel.findOne({ _id: req.params.id})
                 .then(user => {
                   console.log('user before', user)
                   user.setPassword(req.body.newPassword)
                   console.log('user after', user)
                           UserModel.findOneAndUpdate(
                            { _id: req.params.id}, { salt: user.salt, hash: user.hash }, { new: true })
                            .then(user => { 
                             return req.flash('success', "Password successfully changed", '/users/profile/'+req.params.id); 
                             //  ADD RENDER TO ROUTE EVEN THO IT MIGHT BE THE "SAME"
                            })
                            .catch(err => { 
                              res.send(err)
                            })
                 })
                 .catch(err => {
                    res.send(err)
                  })
              } 
              else { 
                console.log('invalid password')
                return req.flash('danger', "Old Password is incorrect", '/users/profile/'+req.params.id);
              } 
          } 
      }); 
       
   } else {
     res.send({error: 'none of the conditions'})
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