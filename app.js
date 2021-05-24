const fs = require('fs');
const { join } = require('path');

const { urlencoded, json: bodyParserJson } = require('body-parser');
const express = require('express');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const { swaggerDefinition, swaggerOptions } = require('./src/config/serverConfig');
const { responseMsg } = require('./src/helpers/utils');

const app = express();

/** ** Morgan Logger for logging each request into custom log files */
const logDir = join(__dirname, 'src/logs', 'access.log');
if (!fs.existsSync(logDir)) {
  if (!fs.existsSync(join(__dirname, 'src/logs'))) {
    fs.mkdirSync(join(__dirname, 'src/logs'));
  }
  fs.writeFileSync(logDir, '', (err) => {
    if (err) console.error(err);

    console.info('The log file is created successfully!');
  });
}
const accessLogStream = fs.createWriteStream(logDir, { flags: 'a' });

app.use(morgan('combined', { stream: accessLogStream }));
/** ** Morgan Logger for logging each request into custom log files */

/**
 * @name helmet
 * @description This middleware helps you secure your Express apps by setting various HTTP headers.
 * Set some special response headers using helmet
 * For further information: https://www.npmjs.com/package/helmet
 */
app.use(require('helmet')());

/**
 * @name compression
 * @description This middleware will compress the assets
 * which are to be sent in the response of server.
 * Compress the assets to be sent in response
 * For further information: https://www.npmjs.com/package/compression
 */
app.use(require('compression')());

/**
 * @name express-status-monitor
 * @description This middleware will report realtime server metrics for Express-based node servers.
 * Run server and go to /status
 * For further information: https://www.npmjs.com/package/express-status-monitor
 */
app.use(require('express-status-monitor')());

/**
 * @name xss-clean
 * @description This middleware will sanitize user input
 * coming from POST body, GET queries, and url params.
 * This will sanitize any data in req.body, req.query, and req.params.
 * For further information: https://www.npmjs.com/package/xss-clean
 */
app.use(require('xss-clean')());

/**
 * @name cors
 * @description This middleware will handle all the cors setting for our app.
 * This middleware can be used to enable CORS with various options.
 * For further information: https://www.npmjs.com/package/cors
 */
app.use(require('cors')({ origin: process.env.CLIENT_URL }));

/** Form encryption application/x-www-form-urlencoded */
app.use(urlencoded({ limit: '50mb', extended: false }));

/** POST routes/APIs data in application/json format */
app.use(bodyParserJson({ limit: '50mb' }));

/** Express Rate Limit for DOS attack prevention */
app.use(rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100 // limit each IP to 100 requests per windowMs
}));

/** ** Best practices app settings */
app.set('port', process.env.PORT || 8000);
app.set('app URL', process.env.APP_URL || 'localhost:8000');
app.set('title', process.env.APP_NAME);
app.set('query parser', 'extended');
app.enable('etag'); // use strong etags
app.set('etag', 'strong');
/** ** Best practices app settings */

/** serve static files */
app.use(express.static(join(__dirname, 'src/public')));

/** Importing database connection when server starts */
require('./src/config/dbConfig');

/**
 * @name Swagger Documentation
 * @description This is used for API documentation. It's not mandatory
 */
app.use(
  '/api/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerJsDoc({
    swaggerDefinition,
    apis: ['./src/routes/*.js']
  }), swaggerOptions)
);

/** Configuring Routes */
app.use('/api', require('./src/routes/routes'));

/** Handling invalid route */
app.use('/', (req, res) => res.status(404).json(responseMsg('Route not found!')));

/** Listening to port */
app.listen(app.get('port'), () => console.info(`Find the server at port:${app.get('port')}`));

module.exports = app;
