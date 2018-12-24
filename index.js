const express = require('express')
const app = express()
var api = require('./api')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


const port = 8001

// app.get('/', (req, res) => {
// 	res.send('Hello World!123')
// 	console.log(req.query)
// })

app.get('/', (req, res) => {
    res.json({ message: 'Hello world' })
})

app.post('/', (req, res) => {
    res.json(req.body)
    console.log(req.body)
})

app.use('/api', api)

app.listen(port, () => console.log(`App listening on port ${port}!`))