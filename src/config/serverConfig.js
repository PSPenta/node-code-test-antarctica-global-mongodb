const config = {};

/** mongodb connection configuration */
const noSqlDbConfig = {
  url: process.env.DB_URL || 'mongodb://localhost:27017/',
  name: process.env.DB_NAME || 'myDB'
};

/** sql connection configuration */
const sqlDbConfig = {
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '3306',
  dialect: process.env.DB_DIALECT || 'mysql',
  name: process.env.DB_NAME || 'myDB'
};

config.db = {
  noSqlDbConfig,
  sqlDbConfig
};

/** JWT Authentication Credentials */
config.jwt = {
  secret: process.env.JWT_SECRET || 'secret',
  expireIn: process.env.JWT_EXPIRE_IN || '1d',
  algorithm: process.env.JWT_ALGORITHM || 'HS256'
};

config.client = process.env.CLIENT_URL || '*';

/** Swagger Definition */
config.swaggerDefinition = {
  info: {
    title: 'Node Global Boilerplate',
    version: '1.0.0',
    description: ''
  },
  host: process.env.HOST || 'localhost:8000',
  basePath: '/api',
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      scheme: 'bearer',
      in: 'header'
    }
  }
};

config.swaggerOptions = {
  customSiteTitle: '[Project Title]',
  customCss: '',
  customFavIcon: ''
};

module.exports = config;
