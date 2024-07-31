const express = require("express");
const {
  signUp,
  login,
  getOne,
  getAll,
  makeAdmin,
  logOut,
  resetPassword,
  forgetPassword,
  verifyEmail,
  resendVerificationEmail,
} = require("../controller/controller");
const { singUpVlidator, logInValidator } = require("../middleware/validation");
const { authenticate } = require("../middleware/userAuth");
const { adminAuth } = require("../middleware/adminAuth");
const router = express.Router();

router.post("/register", singUpVlidator, signUp);
router.post("/log-In", logInValidator, login);
router.get("/get-One/:id", adminAuth, getOne);
router.get("/get-All", authenticate, adminAuth, getAll);
router.put("/Admin/:id", makeAdmin);
router.get("/log-Out", logOut);
router.get("/verify/:token", verifyEmail);
router.get("/reset-Password/:token", resetPassword);
router.get("/forget-password", forgetPassword);
router.post("/resend-verification", resendVerificationEmail);
module.exports = router;
