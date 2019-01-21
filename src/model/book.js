let mongoose = require('mongoose')
let validator = require('validator')

let bookSchema = new mongoose.Schema({
  title: {
  	type: String,
  	required: true
  },
  author: String, 
  year: Number
})

module.exports = mongoose.model('Book', bookSchema );