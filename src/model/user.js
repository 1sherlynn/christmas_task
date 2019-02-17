let mongoose = require('mongoose')
let validator = require('validator')

let userSchema = new mongoose.Schema({
  email: {
  	type: String,
  	required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
    // match: /\S+@\S+\.\S+/,
    validate: {
    validator: function(v) {
        return /\S+@\S+\.\S+/.test(v);
	    },
	    message: '{VALUE} is not a valid email!'
	}
  },
  name: {
  	type: String,
  	required: true
  },
    hash: String, 
    salt: String
})

module.exports = mongoose.model('User', userSchema);


    // match: /\S+@\S+\.\S+/,