var express = require('express')
var router = express.Router()
var moment = require('moment');
let BookModel = require('./book')

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")) // current timestamp
  console.log('Request Method: ', req.method) // log the request method 
  console.log('Path: ', `/api${req.path}`) // log the path 
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
  	BookModel.find().then(books => res.send(books))
  })
  .post(function (req, res) {
    let book = new BookModel({ title: req.body.title, author: req.body.author, year: req.body.year })
	book.save()
	.then(book => { 
		res.send(book)
		console.log(book) 
	}).catch(err => { 
		res.send(err)
		console.error(err) 
	})
  })

router.route('/books/:id')
  .get(function (req, res) {
    BookModel.find({ _id: req.params.id })
    .then(book => { 
    	res.send(book)
    	console.log(book)

    	}).catch(err => { 
    		res.send(err)
    		console.error(err) 
    	})
    // 5c23032e643bc21ae507bb62 ==> book 1
  })
  .put(function (req, res) {
    BookModel.findOneAndUpdate(
    	{ _id: req.params.id}, // search query 
    	 // field:values to update
    	{ title: req.body.title,
    	  author: req.body.author,
    	  year: req.body.year
    	},
    	{ new: true, runValidators: true })  // return updated doc and validate before update 
  	.then(book => { 
  		console.log(book) 
  		res.send(book)
  	})
  	.catch(err => { 
  		console.error(err) 
  		res.send(err)
  	})
  })
  .delete(function (req, res) {
  	BookModel
	  .findOneAndRemove({
	    _id: req.params.id
	  })
	  .then(response => {
	  	res.send(response)
	    console.log(response)
	  })
	  .catch(err => {
	  	res.send(err)
	    console.error(err)
	  })
  })


module.exports = router

