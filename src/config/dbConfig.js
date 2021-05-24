/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const { readdirSync } = require('fs');
const { dirname } = require('path');

/** User define DB Credentials */
const { db: { noSqlDbConfig, sqlDbConfig } } = require('./serverConfig');

const database = process.env.DB_DRIVER || '';

if (database.toLowerCase() === 'mongodb') {
  // Bring in the mongoose module
  // eslint-disable-next-line import/no-unresolved
  const mongoose = require('mongoose');
  const { url, name } = noSqlDbConfig;
  const dbURI = url + name;

  // console to check what is the dbURI refers to
  console.info('Database URL is => ', dbURI);

  // Open the mongoose connection to the database
  mongoose.connect(dbURI, {
    config: {
      autoIndex: false
    },
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  // Db Connection
  const db = mongoose.connection;

  db.on('connected', () => {
    console.info(`Mongoose connected to ${dbURI}`);
    readdirSync(`${dirname(require.main.filename)}/src/models`).forEach((file) => require(`${dirname(require.main.filename)}/src/models/${file}`));
  });

  db.on('error', (err) => console.error('\x1B[31m', `=> Mongoose connection error: ${err}`, '\033[37m'));

  db.on('disconnected', () => console.warn('\x1b[33m%s\x1b[0m', '-> Mongoose disconnected!', '\033[37m'));

  process.on('SIGINT', () => {
    db.close(() => {
      console.warn('\x1b[33m%s\x1b[0m', '-> Mongoose disconnected through app termination!', '\033[37m');
      process.exit(0);
    });
  });

  // Exported the database connection which is to be imported at the server
  exports.default = db;
} else if (database.toLowerCase() === 'sql') {
  // Bring in the sequelize module
  // eslint-disable-next-line import/no-unresolved
  const Sequelize = require('sequelize');
  const {
    name,
    username,
    password,
    host,
    port,
    dialect
  } = sqlDbConfig;

  // logging: false because sequelize by default log all DB activities in console
  // which will unnecessarily flood the console.
  const sequelize = new Sequelize(name, username, password, {
    host,
    port,
    dialect,
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  });

  sequelize
    .authenticate()
    .then(() => console.info(`Sequelize connection started on database "${name}" from "${dialect}"`))
    .catch((err) => console.error('\x1B[31m', `=> Sequelize connection error: ${err}`, '\033[37m'));

  process.on('SIGINT', () => {
    console.warn('\x1b[33m%s\x1b[0m', '-> Sequelize disconnected through app termination!', '\033[37m');
    process.exit(0);
  });

  /**
   * Pass name of the model defined in Sequelize Schema and get it imported
   *
   * @param {String} model Name of the model
   *
   * @return {Any} data which is given if it exists or False
   */
  exports.model = (model) => require(`../models/${model}`)(sequelize, Sequelize);

  /** ** Establishing Relationships */
  // this.model('User').hasOne(this.model('Employee'));
  // this.model('Employee').belongsTo(this.model('User'), { constraints: true, onDelete: 'CASCADE' });

  // this.model('User').hasMany(this.model('Blacklist'));
  // this.model('Blacklist').belongsTo(this.model('User'), { constraints: true, onDelete: 'CASCADE' });
  /** ** Establishing Relationships */

  sequelize.sync()
    .then(() => console.info('Sequelize connection synced and relationships established.'))
    .catch((err) => console.error('\x1B[31m', err, '\033[37m'));

  // Exported the database connection which is to be imported at the server
  exports.default = sequelize;
} else {
  console.warn('\x1b[33m%s\x1b[0m', '-> Application is running without database connection!', '\033[37m');
  process.exit(0);
}
