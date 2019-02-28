let mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator');
const crypto = require('crypto');

let UserSchema = new mongoose.Schema({
  email: {
  	type: String,
  	required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
    match: [/\S+@\S+\.\S+/, '{VALUE} is not a valid email!!!!']
 //    validate: {
 //    validator: function(v) {
 //        return /\S+@\S+\.\S+/.test(v);
	//     },
	//     message: '{VALUE} is not a valid email!'
	// }
  },
  name: {
  	type: String,
  	required: true
  },
    hash: String, 
    salt: String
})

UserSchema.plugin(require('mongoose-role'), {
  roles: ['public', 'user', 'admin'],
  accessLevels: {
    public: ['public', 'user', 'admin'],
    user: ['user', 'admin'],
    admin: ['admin']
  }
})


UserSchema.methods.setPassword = function(password) { 
    this.salt = crypto.randomBytes(16).toString('hex'); 
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, `sha512`).toString(`hex`); 
    console.log('SALT: ', this.salt, ' |  HASH: ', this.hash)
}; 

UserSchema.methods. validPassword = function(password) { 
    var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, `sha512`).toString(`hex`); 
    return this.hash === hash; 
}; 

module.exports = mongoose.model('User', UserSchema);
UserSchema.plugin(uniqueValidator);


    // match: /\S+@\S+\.\S+/,
