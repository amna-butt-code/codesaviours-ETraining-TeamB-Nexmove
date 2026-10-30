const {StatusCode} = require('../consts/statusCode');
const User = require('../models/User');
const Patient = require('../models/patient');
const responseHandler = require("../utils/responseHandler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");



const registerUser = async (req, res) => {
  try {
const { name, email, password, phone, dateOfBirth, address } = req.body;
    if (
          typeof name !== "string" ||
          typeof email !== "string" ||
          typeof password !== "string" ||
          typeof phone !== "string" ||
          !name.trim() ||
          !email.trim() ||
          !password ||
          !phone.trim()
         ) 
         {
      return responseHandler( res, StatusCode.BAD_REQUEST,"Name, email, password, and phone are required");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return responseHandler(
        res,
        StatusCode.ALREADY_EXIST,
        "User already exists"
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "patient",
    });
    console.log("User created:", newUser._id);
console.log("Patient collection:", Patient.collection.name);

  await Patient.create({
  user: newUser._id,
  phone: phone.trim(),
  dateOfBirth: dateOfBirth || undefined,
  address: address?.trim() || undefined,
});
console.log("Patient profile created successfully");


    return responseHandler(res,StatusCode.SUCCESS,"User registered successfully",
      {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      }
    );
  } catch (error) {
    console.error("Registration error:", error.message);

    return responseHandler(
      res,
      StatusCode.SERVER_ERROR,
      "Error registering user"
    );
  }
};


  const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return responseHandler(res,StatusCode.BAD_REQUEST,"Email and password are required");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return responseHandler(res,StatusCode.UNAUTHORIZED,"Invalid email or password");
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      return responseHandler(res,StatusCode.SERVER_ERROR,"Authentication is not configured");
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return responseHandler(res,StatusCode.SUCCESS,"Login successful",{
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return responseHandler(res,StatusCode.SERVER_ERROR,"Unable to log in",error);
  }
};


const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return responseHandler(
        res,
        StatusCode.NOT_FOUND,
        "User not found"
      );
    }

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return responseHandler(
          res,
          StatusCode.BAD_REQUEST,
          "Name must not be empty"
        );
      }
      user.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string" || !email.trim()) {
        return responseHandler(
          res,
          StatusCode.BAD_REQUEST,
          "Email must not be empty"
        );
      }

      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: id },
      });

      if (existingUser) {
        return responseHandler(
          res,
          StatusCode.ALREADY_EXIST,
          "Email already exists"
        );
      }

      user.email = normalizedEmail;
    }

    if (role !== undefined) {
      if (!["patient", "therapist", "admin"].includes(role)) {
        return responseHandler(
          res,
          StatusCode.BAD_REQUEST,
          "Invalid role"
        );
      }
      user.role = role;
    }

    await user.save();

    return responseHandler(res,StatusCode.OK,"User updated successfully",
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    );
  } catch (error) {
    console.error("Update user error:", error);
    return responseHandler(res,StatusCode.SERVER_ERROR,"Error updating user");
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return responseHandler(res,StatusCode.NOT_FOUND,"User not found");
    }

    return responseHandler(res,StatusCode.SUCCESS,"User deleted successfully");
  } catch (error) {
    console.error("Delete user error:", error);
    return responseHandler(res,StatusCode.SERVER_ERROR,"Error deleting user"
    );
  }
};


  module.exports = {registerUser, userLogin, updateUser, deleteUser};