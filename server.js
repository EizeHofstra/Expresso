const express = require('express')
const app = express();


const PORT = process.env.PORT || 4000;

//cors middleware
const cors = require('cors');
app.use(cors());

//body parsing middleware
const bodyParser = require('body-parser');
app.use(bodyParser.json());

//logging middleware
const morgan = require('morgan');
app.use(morgan('dev'));

//error handling middleware
const errorhandler = require('errorhandler');
app.use(errorhandler());

//apiRouter is mounted here
const apiRouter = require('./server/api')
app.use('/api', apiRouter);

//PORT listen
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
})


module.exports = app;
