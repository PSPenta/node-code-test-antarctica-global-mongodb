const { verify } = require('jsonwebtoken');

const { model } = require('../config/dbConfig');
const { jwt } = require('../config/serverConfig');
const { responseMsg } = require('../helpers/utils');

// eslint-disable-next-line consistent-return
exports.jwtAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      const blacklistedToken = await model('Blacklist').findAll({ where: { token } });
      if (!blacklistedToken || blacklistedToken.length === 0) {
        const decodedToken = verify(token, jwt.secret, (err, decoded) => {
          if (err) {
            console.error('JWT Error:', err);
            return res.status(440).json(responseMsg('Your login session is either expired or the token is invalid, please try logging in again!'));
          }
          return decoded;
        });
        if (decodedToken) {
          req.userId = decodedToken.userId;
          next();
        } else {
          return res.status(401).json(responseMsg('Invalid token!'));
        }
      } else {
        return res.status(401).json(responseMsg('Token invalid!'));
      }
    } else {
      return res.status(401).json(responseMsg('Not authenticated!'));
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json(responseMsg('Internal server error!'));
  }
};
