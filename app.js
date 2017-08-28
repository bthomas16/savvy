const env = require('./env');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const config = require('./config/db')
const path = require('path');
const authentication = require('./routes/authentication')
const api = require('./routes/api')
const bodyParser = require('body-parser');
const cors = require('cors');
const port = process.env.PORT || 8080;

mongoose.Promise = global.Promise;
mongoose.connect(config.url, {useMongoClient: true}, (err) => {
  if (err) {
    console.log('Could not connect to DB: ', err);
  } else {
    console.log('Conencted to DB:' + config.db);
  }
});

app.use(cors({
  origin:'http://localhost:4200'
}));

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static(__dirname + '/public'));
app.use('/api', api);
app.use('/authentication', authentication);

app.get('*', (req,res) => {
  res.sendFile(path.join(__dirname + '/public/index.html'))
})



app.listen(port, () => {
  console.log('Listening on port ' + port + ' in ' + process.env.NODE_ENV + ' mode');
})
