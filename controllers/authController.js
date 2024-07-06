const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../data-services/UserSchema");

const signToken = (id) => {
  console.log(process.env.JWT_SECRET);
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 24 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = async (req, res, next) => {
  try {
    const data = req.body;
    const newUser = await User.create({
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password,
      id: data.id,
      role: data.role,
      payment: false,
      email: data.email,
      age: data.age,
      maxQuestionsPerMonth: 0,
    });
    createSendToken(newUser, 201, req, res);
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

exports.protect = async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    console.log("cookie:", req.cookies);
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new Error("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new Error("The user belonging to this token does no longer exist.", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
};

exports.isLoggedin = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      res.locals.user = currentUser;
      return next();
    } catch (err) {
      console.error("Error in isLoggedin middleware:", err);
      return next();
    }
  }
  next();
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new Error("Please provide email and password!", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user || password !== user.password) {
    return next(new Error("Incorrect email or password", 401));
  }

  createSendToken(user, 200, req, res);
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new Error("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};
