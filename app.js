const config = require('config');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet')
const mongoose = require('mongoose');

const auth = require('./routes/auth');
const users = require('./routes/users');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(helmet())
app.use('/api/auth', auth);
app.use('/api/users', users);

mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);


mongoose.connect(config.get('db'))
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
