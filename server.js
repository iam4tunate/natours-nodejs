const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! | Shutting down...');
  console.log('errr', err.name, err.message);

  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log(`DB connection successful! ${process.env.NODE_ENV}`));

const port = 3000;
const server = app.listen(port, () =>
  console.log(`App running on port ${port}`)
);

// Unhandled Rejections
process.on('unhandledRejection', () => {
  console.log('UNHANDLED REJECTION! | Shutting down...');

  server.close(() => {
    process.exit(1);
  });
});

// Handling uncaught exceptions is crucial, as they can leave the Node.js process in an unstable state, requiring the application to crash and restart to ensure reliability. On the other hand, unhandled rejections, while less severe, should still be addressed to maintain application stability. In production, it’s essential to use tools that automatically restart the application after a crash, and many hosting platforms provide this functionality out of the box.
