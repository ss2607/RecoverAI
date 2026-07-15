require('dotenv').config();
const validateEnv = require('./config/env');

try {
  validateEnv();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const connectDB = require('./config/db');
const app = require('./app');
const http = require('http');
const { initSocket } = require('./config/socket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});
