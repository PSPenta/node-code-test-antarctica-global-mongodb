/* eslint-disable no-undef */
const { compare, hash } = require('bcrypt');
const { validationResult } = require('express-validator');
const { sign } = require('jsonwebtoken');
const { generate: uniqueEmployeeID } = require('shortid');

const { model } = require('../config/dbConfig');
const { jwt } = require('../config/serverConfig');
const { responseMsg } = require('../helpers/utils');

exports.jwtLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json(responseMsg(errors.array()));
    }

    const userData = await model('User').findAll({ where: { email: req.body.email } });
    let token = '';
    if (userData.length && await compare(req.body.password, userData[0].password)) {
      token = sign(
        {
          username: userData[0].username,
          userId: userData[0].id.toString()
        },
        jwt.secret,
        { expiresIn: jwt.expireIn }
      );
    }
    if (token) {
      return res.json(responseMsg(null, true, { token }));
    }
    return res.status(404).json(responseMsg('User not found!'));
  } catch (error) {
    console.error(error);
    return res.status(500).json(responseMsg('Something went wrong!'));
  }
};

exports.jwtLogout = async (req, res) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      if (token) {
        await model('Blacklist').create({
          token,
          user: req.userId
        });
      }
      return res.json(responseMsg(null, true, 'Successfully logged out!'));
    }
    return res.status(401).json(responseMsg('Not authenticated!'));
  } catch (error) {
    console.error(error);
    return res.status(500).json(responseMsg('Something went wrong!'));
  }
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json(responseMsg(errors.array()));
    }

    const data = await model('User').findAll({ where: { email: req.body.email } });
    if (!data || !data[0]) {
      const hashedPassword = await hash(req.body.password, 256);
      const user = await model('User').create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPassword
      });

      if (user) {
        await model('Employee').create({
          employeeId: uniqueEmployeeID(),
          organization: req.body.organization,
          user_id: user.id
        });
        return res.status(201).json(responseMsg(null, true, { message: 'User added successfully!' }));
      }
      return res.status(404).json(responseMsg('Something went wrong!'));
    }
    return res.status(404).json(responseMsg('Email is already registered for some other user, please choose a unique one!'));
  } catch (error) {
    console.error(error);
    return res.status(500).json(responseMsg('Internal server error!'));
  }
};
