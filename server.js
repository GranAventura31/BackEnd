const express = require('express')
const mysql = require('mysql')
const myconn = require('express-myconnection')
const cors = require('cors')

const routes = require('./routes/route')

const app = express()

app.set('port', process.env.PORT || 5000)

const dbOptions ={
    host: "localhost",
    port: 3308,
    user: "root",
    database: "granaventura"
}

// Middleware
app.use(myconn(mysql, dbOptions, `single`))
app.use(express.json())
app.use(cors())

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to my api')
})

app.use('/api', routes)

// Server running
app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
})
