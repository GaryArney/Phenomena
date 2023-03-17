// Use the dotenv package, to create environment variables
require('dotenv').config();
// Create a constant variable, PORT, based on what's in process.env.PORT or fallback to 3000
const PORT = process.env.PORT || 3000;
// Import express, and create a server
const express = require('express');
const app = express();
// Require morgan and body-parser middleware
const morgan = require('morgan');
const bodyParser = require('body-parser');

// Have the server use morgan with setting 'dev'
app.use(morgan('dev'));

// Import cors 
const cors = require('cors')
// Have the server use cors()
app.use(cors());
// Have the server use bodyParser.json()
app.use(bodyParser.json());

// app.use('/dist', express.static(path.join(__dirname, 'dist')));   <-check ss, example

// app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html'))) <-check ss, example

// Have the server use your api router with prefix '/api'
const { router } = require('./api/index.js');
app.use('/api', router)
// Import the client from your db/index.js
const { client } = require('./db');
// Create custom 404 handler that sets the status code to 404.
app.use('*', (error, res, req, next) => {
    res.status(404);
    res.send({ error: 'route not found' })
})
// Create custom error handling that sets the status code to 500
// and returns the error as an object
app.use((error, req, res, next) => {
    res.status(500);
    res.send({ error: error.message });
})

// Start the server listening on port PORT
// On success, connect to the database
app.listen(PORT, () => {
    client.connect();
    console.log(`Listening on PORT, ${PORT}`)
  });