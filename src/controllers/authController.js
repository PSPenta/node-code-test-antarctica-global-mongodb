/* eslint-disable no-underscore-dangle */
const { compare, hash } = require('bcrypt');
const { validationResult } = require('express-validator');
const { sign } = require('jsonwebtoken');
const { model } = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const { jwt } = require('../config/serverConfig');
const { responseMsg } = require('../helpers/utils');

exports.jwtLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json(responseMsg(errors.array()));
    }

    const userData = await model('user').findOne({ email: req.body.email });
    let token = '';
    if (userData && await compare(req.body.password, userData.password)) {
      token = sign(
        {
          email: userData.email,
          userId: userData._id.toString()
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
        await model('blacklist').create({
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

    const data = await model('user').findOne({ email: req.body.email });
    if (!data) {
      const hashedPassword = await hash(req.body.password, 256);
      const user = await model('user').create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPassword
      });

      if (user) {
        const employee = await model('employee').create({
          employeeId: uuidv4(),
          organization: req.body.organization,
          user: user._id
        });
        user.employee = employee._id;
        user.save();
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
