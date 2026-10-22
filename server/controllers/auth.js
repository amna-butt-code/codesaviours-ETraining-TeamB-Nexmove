const StatusCode = require('../consts/statusCode');
const User = requiore('../models/User');
const responseHandler = require('../utils/responseHandler');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const registerUser = async (req,res)=>{
    const {name,email,password,role} = req.body;

    try{
        const existingUser = await User.findOne({email:email});
        if(existingUser){
            return responseHandler(res,StatusCode.ALREADY_EXIST,"User already exists");

        }

        const normalozedEmail = email.trim().toLowerCase();
        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = await User.create({
            name:name.trim(),
            email:normalozedEmail,
            password:hashedPassword,
            role:role.trim()
        })
        responseHandler(res,StatusCode.CREATED,"User registered successfully",newUser);
    }catch(error){
        responseHandler(res,StatusCode.INTERNAL_SERVER_ERROR,"Error registering user",error);
    };

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
      return responseHandler(res,StatusCode.INTERNAL_SERVER_ERROR,"Authentication is not configured");
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return responseHandler(res,StatusCode.OK,"Login successful",{
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
    return responseHandler(res,StatusCode.INTERNAL_SERVER_ERROR,"Unable to log in",error);
  }
}

  module.exports = {registerUser, userLogin};