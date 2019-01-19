const express = require('express')
var sassMiddleware = require('node-sass-middleware');
var path = require('path');
const app = express()
var api = require('./src/routes/api')
var view = require('./src/routes/view')

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
    outputStyle: 'compressed',
    prefix:  '/stylesheets'  // Where prefix is at <link rel="stylesheets" href="stylesheets/style.css"/>
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

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
app.listen(port, () => console.log(`App listening on port ${port}!`))