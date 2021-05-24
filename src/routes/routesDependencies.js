/* eslint-disable global-require */
module.exports = {
  controllers: {
    authClient: require('../controllers/authController')
  },
  middlewares: {
    auth: require('../middlewares/auth')
  }
};
