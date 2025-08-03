const userService = require('../services/userService');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.updateRole = async (req, res, next) => {
  try {
    const updated = await userService.updateRole(req.params.id, req.body.role);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
