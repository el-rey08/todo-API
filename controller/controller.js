const todoModel = require('../model/model')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const nodeMailer = require('nodemailer')
const bcrypt = require('bcrypt')
const sendMail = require('../helpers/email')
const {htmlTemplate, verifyTemplate} = require('../helpers/template')

exports.signUp = async (req, res) => {
    try {
      const { fullname, email, password } = req.body;
      // check if  user is already existing
      const existingUser = await todoModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: "user already exist",
        });
      } else {
        const saltedPassword = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, saltedPassword);
        const user = new todoModel({
          fullname,
          email: email.toLowerCase(),
          password: hashPassword,
        });
  
        //verifing the email
        const token = jwt.sign(
          {
            id: user._id,
            email: user.email,
          },
          process.env.JWT_SECRET,
          { expiresIn: "20min" }
        );
        const verifyLink = `${req.protocol}://${req.get("host")}/api/v1/user/verify/${token}`;
  
        let mailOptions = {
          email: user.email,
          subject: "email verification",
          html: htmlTemplate(verifyLink, user.fullname),
        };
        await user.save(mailOptions);
        // await sendMail(mailOptions);
        res.status(201).json({
          message: "user created successfully",
          data: user,
        });
      }
    } catch (error) {
      res.status(500).json(error.message);
    }
  };
  
  // login
  exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const existingUser = await todoModel.findOne({ email });
  
      // check is user is not registered
      if (!existingUser) {
        return res.status(400).json({
          message: "user not found",
        });
      }
      const checkPassword = await bcrypt.compare(password, existingUser.password);
      if (!checkPassword) {
       return res.status(400).json({
          message: "incorrect password",
        });
      }
      if(!existingUser.isVerified){
        return res.status(400).json({
          message:'user not verified please check your email for verification link'
        })
      }
  
      // genrating a token
      const token = jwt.sign(
        {
          userId: existingUser._id,
          email: existingUser.email,
          name: existingUser.fullname,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.status(200).json({
        message: `${existingUser.fullname} is logged in`,
        data: existingUser,
        token,
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  };
  
  exports.verifyEmail = async (req, res) => {
    try {
      // Extract the token from the request params
      const { token } = req.params;
      // Extract the email from the verified token
      const { email } = jwt.verify(token, process.env.JWT_SECRET);
      // Find the user with the email
      const user = await todoModel.findOne({ email });
      // Check if the user is still in the database
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      // Check if the user has already been verified
      if (user.isVerified) {
        return res.status(400).json({
          message: "User already verified",
        });
      }
      // Verify the user
      user.isVerified = true;
      // Save the user data
      await user.save();
      // Send a success response
      res.status(200).json({
        message: "User verified successfully",
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.json({ message: "Link expired." });
      }
      res.status(500).json({
        message: error.message,
      });
    }
  };
    
  // resending verification link
  exports.resendVerificationEmail = async (req, res) => {
    try {
      const { email } = req.body;
      // Find the user with the email
      const existingUser = await todoModel.findOne({ email });
      // Check if the user is still in the database
      if (!existingUser) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      // Check if the user has already been verified
      if (existingUser.isVerified) {
        return res.status(400).json({
          message: "User already verified",
        });
      }
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: "20mins",
      });
      const verifyLink = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/user/verify/${token}`;
      let mailOptions = {
        email: existingUser.email,
        subject: "Verification email",
        html: verifyTemplate(verifyLink, existingUser.fullName),
      };
      // Send the the email
      await sendMail(mailOptions);
      // Send a success message
      res.status(200).json({
        message: "Verification email resent successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };
  
  // forget password
  exports.forgetPassword = async (req, res) => {
    try {
      const { email } = req.body;
      const existingUser = await todoModel.findOne({ email });
      if (!existingUser) {
        return res.status(404).json({
          message: "user not found",
        });
      }
      const resetToken = jwt.sign(
        { email: existingUser.email },
        process.env.JWT_SECRET,
        {
          expiresIn: "20mins",
        }
      );
      let mailOptions = {
        email: existingUser.email,
        subject: "password reset",
        html: `please click the link to reset your password: <a href="${
          req.protocol
        }://${req.get(
          "host"
        )}/api/v1/user/reset-password/${resetToken}>Reset password</a>link expiers in 30min"`,
      };
      await sendMail(mailOptions);
      res.status(200).json({
        message: "password reset email sent succesfully",
      });
    } catch (error) {
      res.status(500).jason(error.message);
    }
  };
  
  // password resetting
  exports.resetPassword = async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;
      const { email } = jwt.verify(token, process.env.JWT_SECRET);
      const existingUser = await todoModel.findOne({ email });
      if (!existingUser) {
        return res.status(404).json({
          message: "user not found",
        });
      }
      const saltedRound = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, saltedRound);
      existingUser.password = hashed;
      await existingUser.save();
      res.status(200).json({
        message: "password reset successfully",
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  };
  
  exports.makeAdmin = async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await todoModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          message: "user not found",
        });
      }
      user.isAdmin = true;
      await user.save();
      res.status(200).json({
        message: "user now an admin",
        data: user,
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  };
  
  //get all customers
  exports.getAll = async (req, res) => {
    try {
      const allCustomers = await todoModel.find();
      res.status(200).json({
        message: "below are the registered customer",
        data: allCustomers,
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  };
  // get a specific customer
  exports.getOne = async (req, res) => {
    try {
      let id = req.params.id;
      const oneCustomer = await todoModel.findById(id);
      res.status(200).json({
        message: "below is the requested customer's information",
        data: oneCustomer,
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  };
  
  exports.logOut = async (req, res) => {
    try {
        const auth = req.headers.authorization;
        const token = auth.split(' ')[1];
  
        if(!token){
            return res.status(401).json({
                message: 'invalid token'
            })
        }
        // Verify the user's token and extract the user's email from the token
        const { email } = jwt.verify(token, process.env.JWT_SECRET);
        // Find the user by ID
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        user.blackList.push(token);
        // Save the changes to the database
        await user.save();
        //   Send a success response
        res.status(200).json({
            message: "User logged out successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
  }

  exports.makeAdmin = async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          message: "user not found",
        });
      }
      user.isAdmin = true;
      await user.save();
      res.status(200).json({
        message: "user now an admin",
        data: user,
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  };
  
  //Delete a customer
  exports.remove = async (req, res) => {
    try {
      let id = req.params.id;
      const existingUser = await userModel.findByIdAndDelete(id);
      //check if the customer exist
      if (!existingUser) {
        res.staus(400).json({
          message: "user not found",
        });
      }
      // after check if the customer does not exist, delete
      const deleteUser = await userModel.findByIdAndDelete(id);
      res.status(200).json({
        // sending a success message
        message: "deleted successfully",
        data: deleteUser,
      });
      // sending error message
    } catch (error) {
      res.status(500).json(error.message);
    }
  };
  