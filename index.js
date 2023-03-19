require('dotenv').config();
const PORT = process.env.PORT || 3000;
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
console.log("__dirname: ", __dirname);

app.use(morgan('dev'));

const cors = require('cors')

app.use(cors());

app.use(bodyParser.json());

app.use('/dist', express.static(path.join(__dirname, 'dist')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')))

const { router } = require('./api/index.js');

app.use('/api', router)

const { client } = require('./db');

app.use('*', (error, res, req, next) => {
    res.status(404);
    res.send({ error: 'route not found' })
})

app.use((error, req, res, next) => {
    res.status(500);
    res.send({ error: error.message });
})

app.listen(PORT, () => {
    client.connect();
    console.log(`Listening on PORT, ${PORT}`)
});