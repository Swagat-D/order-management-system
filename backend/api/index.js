const serverless = require('serverless-http');
const app = require('../server'); // or wherever your Express app is

module.exports = serverless(app);
