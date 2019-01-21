var express = require('express')
var router = express.Router()
var moment = require('moment');
var q2m = require('query-to-mongo')
let BookModel = require('../../src/model/book')



// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")) // current timestamp
  console.log('Request Method: ', req.method) // log the request method 
  console.log('Path: ', `/api${req.path}`) // log the path 
  next()
})

router.get('/add', function (req, res) {
  // res.json({message: 'Sub-route GET to /api'})
  res.render('add_book', { success: req.session.success, errors: req.session.errors })
  req.session.errors = null;
})

router.route('/')
  .get(function (req, res) {
  	var query = q2m(req.query);
  	console.log(query)
  	if(query.criteria.count) {
  		BookModel.countDocuments({}, function (err, count) {
	  	if (err) {
	        res.send(err);
	        return;
	    }
	    res.json({ count: count });
	  	console.log('There are %d books', count);
	})

  	} else {
  		BookModel.find(query.criteria, query.options.fields)
		  	.sort(query.options.sort)
		  	.limit(query.options.limit)
		  	.skip(query.options.skip)
	  	.then(books => 
        res.render('index', {"books": books})
        // res.send({books: books})

        // res.render('hello', {"name": "Sherlynn"})
        
        )
	  	.catch(err => {
	  		res.send(err)
	  		console.log(err)
	  	})
  	}
  })
  .post(function (req, res) {
     let book = new BookModel({ title: req.body.title, author: req.body.author, year: req.body.year })
     let title = req.body.title;
     let author = req.body.author;
     let year = req.body.year;

     req.checkBody('title', 'Title is required').notEmpty();
   var errors = req.validationErrors();
   var titleError = false
   var authorError = false
   var yearError = false
   if(errors){
      req.session.errors = errors;
      errors.map(error => {
        if (error.param === 'title') {
          titleError = true
        } 
        if (error.param === 'author') {
          authorError = true
        } 
        if (error.param === 'year') {
          yearError = true
        }
      })
      req.session.success = false;
      res.render('add_book', {success: req.session.success, errors: req.session.errors, titleError: titleError, authorError: authorError, yearError: yearError});
   }
   else{
      req.session.success = true;
      res.redirect('/view');
   }

	book.save()
	.then(book => { 

		// res.send(book)
		console.log(book) 
    res.redirect('/view');
	}).catch(err => { 
		res.send(err)
		console.error(err) 
	})
  })

router.route('/:id')
  .get(function (req, res) {
    BookModel.find({ _id: req.params.id })
    .then(book => { 
    	// res.send(book)
      res.render('book', {"book": book})
      console.log(`Get a book with id ${req.params.id}`,book)
    	}).catch(err => { 
    		res.send(err)
    		console.error(err) 
    	})
  })
  .put(function (req, res) {
    BookModel.findOneAndUpdate(
    	{ _id: req.params.id}, // search query 
    	 // field:values to update
    	{ title: req.body.title,
    	  author: req.body.author,
    	  year: req.body.year
    	},
    	{ new: true, runValidators: true })  // return updated entry and validate before update 
  	.then(book => { 
  		console.log(`Edit a book with id ${req.params.id}`)
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
      console.log(`Delete a book witth id ${req.params.id}`)
	    console.log(response)
	  })
	  .catch(err => {
	  	res.send(err)
	    console.error(err)
	  })
  })



module.exports = router


