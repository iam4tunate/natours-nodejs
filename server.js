const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });

// this is the connection string to the database, it can either be for the Local Database or the Atlas Database.if it's Local Database, terminal must be running.
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => console.log('DB connection successful!'));

const port = 3000;
app.listen(port, () => console.log(`App running on port ${port}`));
