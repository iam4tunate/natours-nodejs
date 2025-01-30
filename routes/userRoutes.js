const express = require('express');

const userController = require('../controllers/userContoller');
const { createUser, deleteUser, getAllUsers, getUser, updateUser } =
    userController;
  
const router = express.Router();

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
