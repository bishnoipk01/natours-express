const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('uncaught Exception....shutting down the server');
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const port = process.env.PORT || 3000;
const db = process.env.DATABASE_CLOUD.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('connected to database!'))
  .catch(() => console.log('error connecting to database!'));

const server = app.listen(port, () => {
  console.log(`Listening to server at http://localhost:${port}`);
});

// if (process.env.NODE_ENV !== 'production') console.log('development');
// else console.log('production');

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('unhandled rejection....shutting down the server');
  server.close(() => {
    process.exit(1);
  });
});
