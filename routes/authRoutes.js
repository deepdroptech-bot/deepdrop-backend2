const express = require("express");
const router = express.Router();

const auth = require("../middleware/authmiddleware");
const allowRoles = require("../middleware/rolemiddleware");

const {
  createUser,
  loginUser,
  getCurrentUser,
  getUsers,
  getUserById,
  updateUser,
  updateCurrentUser,
  deleteUser,
  logoutUser
} = require("../controllers/authControllers");

router.post("/login", loginUser);

router.post(
  "/newusers",
  createUser
);

router.post(
  "/users",
  auth,
  allowRoles("admin"),
  createUser
);

router.get(
    "/me", 
    auth, 
    getCurrentUser);

router.get(
  "/users",
  auth,
  allowRoles("admin"),
  getUsers
);

router.get(
  "/users/:id",
  auth,
  allowRoles("admin"),
  getUserById
);

router.put(
  "/users/:id",
  auth,
  allowRoles("admin"),
  updateUser
);

router.put(
  "/me",
  auth,
  updateCurrentUser
);

router.delete(
  "/users/:id",
  auth,
  allowRoles("admin"),
  deleteUser
);

router.post(
  "/logout",
  auth,
  logoutUser
);

module.exports = router;
