const fs = require("fs");
const path = require("path");
const User = require("../../model/user");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const { uploadOnCloudinary } = require("../../utility/cloudanry");
const { sendEmail } = require("../../utility/Email"); 
const {generateOTP} = require("../../utility/otp");

const getNextId = async () => {
  try {
    const lastForm = await User.findOne().sort({ id: -1 });
    return lastForm ? lastForm.id + 1 : 1;
  } catch (error) {
    throw new Error("Error fetching the next user ID");
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const id = await getNextId();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const fileUrl = req.file
      ? await uploadOnCloudinary(req.file.path)
      : "default-file.jpg";

    const otp = generateOTP();

    const result = await User.create({
      id: id,
      name: name,
      email: email,
      password: hashedPassword,
      file: fileUrl,
      otp,
      otpCreatedAt: new Date(),
      isVerified: false,
    });

    await sendEmail(
      email,
      "Verify your email",
      `Your OTP code is ${otp}`
    );

    res.status(201).json({ message: "User successfully created. Please check your email for the OTP code.", data: result });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error creating user", error });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: "Email not verified." });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name, file: user.file },
      process.env.JWT_SECRET
    );

    res.json({ message: "Login successful", data: user, token: token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};


exports.showdata = async (req, res) => {
  try {
    const data = await User.find();
    res.status(200).json({ message: "Get data successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving data", error });
  }
};

exports.showdatabyid = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid user ID" });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(user);
  } catch (error) {
    res.status(500).send({ message: "Error fetching user", error });
  }
};

exports.editdata = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const updates = req.body;

  try {
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (req.file) {
      if (user.file && user.file !== "default-file.jpg") {
        const publicId = user.file.split("/").pop().split(".")[0];
        cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) {
            console.error("Error deleting old file from Cloudinary:", error);
          } else {
            console.log("Old file deleted from Cloudinary:", result);
          }
        });
      }

      const newFileUrl = await uploadOnCloudinary(req.file.path);
      updates.file = newFileUrl;
    }

    // Hash the password if it is being updated
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedUser = await User.findOneAndUpdate({ _id: id }, updates, {
      new: true,
    });
    res.status(200).json({ message: "User updated successfully", data: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).send({ message: "Error updating user", error });
  }
};

exports.deletedata = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid user ID" });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (user.file && user.file !== "default-file.jpg") {
      const publicId = user.file.split("/").pop().split(".")[0];
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          console.error("Error deleting file from Cloudinary:", error);
        } else {
          console.log("File deleted from Cloudinary:", result);
        }
      });
    }

    res.status(200).send({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send({ message: "Error deleting user", error });
  }
};

exports.logout = async (req, res) => {
  res.status(200).json({ message: "Logout successful" });
};

// varify email
exports.verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const currentTime = new Date();
    const otpValidDuration = 2 * 60 * 1000; // 2 minutes in milliseconds

    if (currentTime - user.otpCreatedAt > otpValidDuration) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpCreatedAt = null;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error verifying email", error });
  }
};

// resend email
exports.resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpCreatedAt = new Date();
    await user.save();

    await sendEmail(
      email,
      "Resend OTP",
      `Your new OTP code is ${otp}`
    );

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error resending OTP", error });
  }
};


