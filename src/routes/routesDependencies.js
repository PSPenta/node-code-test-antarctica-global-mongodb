/* eslint-disable global-require */
module.exports = {
  controllers: {
    authClient: require('../controllers/authController'),
    others: require('../controllers/otherController')
  },
  middlewares: {
    auth: require('../middlewares/auth')
  }
};
