const express = require('express')
const expressValidator = require('express-validator');
var sassMiddleware = require('node-sass-middleware');
var path = require('path');
const app = express()
var api = require('./src/routes/api')
var view = require('./src/routes/view')
var secure = require('./src/routes/secure')
var user = require('./src/routes/user')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

var mustacheExpress = require('mustache-express');

app.use(bodyParser.json()) 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(cookieParser());
app.use(session({secret: 'sherlynn', saveUninitialized: false, resave: false}));


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

// Register '.mustache' extension with The Mustache Express
app.engine('html', mustacheExpress());

app.set('view engine', 'html');
app.set('views', __dirname + '/src/views');

var mongoose = require('mongoose');
var db_url = 'mongodb://localhost:27017/books';

mongoose.connect(db_url);
mongoose.Promise = global.Promise;
var db = mongoose.connection;


db.on('error', console.error.bind(console, 'MongoDB connection error: '));
db.once('open', function() {
    console.log("Successfully connected to Mongo Server.");
});



app.use(sassMiddleware({
    /* Options */
    src: __dirname + '/src/styles',
    dest: __dirname + '/public/css',
    indentedSyntax : false,
    debug: true,
    force: true,
    sourceMap: true,
    outputStyle: 'compressed', 
    prefix:  '/stylesheets'  // Where prefix is at <link rel="stylesheets" href="stylesheets/style.css"/>
}));


const port = 8001

app.get('/', (req, res) => {
	res.redirect('/app.html');
    // res.send('Hello world!')
    // res.json({ message: 'Hello world' })
})


app.post('/', (req, res) => {
    res.json(req.body)
    console.log(req.body)
})


app.use('/api', api)
app.use('/view', view)
app.use('/secure', secure)
app.use('/users', user)
app.listen(port, () => console.log(`App listening on port ${port}!`))