var express = require('express')
var router = express.Router()
var moment = require('moment');
var q2m = require('query-to-mongo')
let UserModel = require('../../src/model/user')


router.route('/')
  .get(function (req, res) {
    UserModel.find({}).then(users => 
      res.json({users: users})
    )
  })
  .post(function (req, res) {
    let user = new UserModel({ 
      email: req.body.email, 
      name: req.body.name
      })
  user.save()
  .then(user => { 
    res.send(user)
  }).catch(err => { 
    res.send(err)
    })
  })

router.route('/:id')
  .get(function (req, res) {
    UserModel.find({ _id: req.params.id })
    .then(user => { 
      res.send(user)
      console.log(`Get a user with email ${req.params.email}`, user)
      }).catch(err => { 
        res.send(err)
        console.error(err) 
      })
  })
  .put(function (req, res) {
    UserModel.findOneAndUpdate(
      { _id: req.params.id}, // search query 
      { email: req.body.email,
        name: req.body.name
      },
      { new: true, runValidators: true }) 
    .then(user => { 
      console.log(`Edit a user with email ${req.params.email}`)
      res.send(user)
    })
    .catch(err => { 
      console.error(err) 
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
      console.log(`Delete a user with email ${req.params.email}`)
      console.log(response)
    })
    .catch(err => {
      res.send(err)
      console.error(err)
    })
  })


module.exports = router