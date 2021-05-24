const { validationResult } = require('express-validator');
const { model } = require('mongoose');

const { responseMsg } = require('../helpers/utils');

exports.getUsers = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json(responseMsg(errors.array()));
    }

    let query = {};
    if (req.query.search) {
      query = {
        $or: [
          { firstName: { $regex: `.*${req.query.search}.*` } },
          { lastName: { $regex: `.*${req.query.search}.*` } },
          { 'employee.employeeId': { $regex: `.*${req.query.search}.*` } }
        ]
      };
    }

    let orderBy = { _id: 1 };
    if (req.query.sort) {
      const sortKey = req.query.sort;
      const sortVal = parseInt(req.query.order, 10);
      orderBy = {};
      orderBy[sortKey] = sortVal;
    }

    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const users = await model('user').find(query).populate('employee').sort(orderBy)
      .limit(limit)
      .skip(limit * (page - 1));

    if (users) {
      return res.json(responseMsg(null, true, users, true));
    }
    return res.status(404).json(responseMsg('No users found!'));
  } catch (error) {
    console.error(error);
    return res.status(500).json(responseMsg('Internal server error!'));
  }
};
