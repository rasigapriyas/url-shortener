// jwt token package
const jwt = require("jsonwebtoken");
// database connection
const prisma = require("../config/prisma");

// password hashing package
const bcrypt = require("bcrypt");

// register user business logic
const registerUser = async (userData) => {

  // get request data
  const { name, email, password } = userData;

  // check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  // stop duplicate registration
  if (existingUser) {
    return {
      message: "Email already registered",
    };
  }

  // convert password into hash
  const hashedPassword = await bcrypt.hash(password, 10);

  // create user in database
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // generate random 6 digit otp
  const otp = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  // otp expires after 10 minutes
  const expiresAt = new Date(
    Date.now() + 10 * 60 * 1000
  );

  // save otp in database
  await prisma.userOtp.create({
    data: {
      userId: user.id,
      otp,
      purpose: "REGISTER",
      expiresAt,
    },
  });

  // return success response
  return {
    message: "User registered successfully",
    userId: user.id,
    email: user.email,
    otp,
  };

};


// verify user otp
const verifyOtp = async (otpData) => {

  // get request data
  const { email, otp } = otpData;

  // find user by email
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  // user not found
  if (!user) {
    return {
      message: "User not found",
    };
  }

  // find latest register otp
  const savedOtp = await prisma.userOtp.findFirst({
    where: {
      userId: user.id,
      purpose: "REGISTER",
      verified: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // otp record not found
  if (!savedOtp) {
    return {
      message: "OTP not found",
    };
  }

  // otp mismatch
  if (savedOtp.otp !== otp) {
    return {
      message: "Invalid OTP",
    };
  }

  // otp expired
  if (savedOtp.expiresAt < new Date()) {
    return {
      message: "OTP expired",
    };
  }

  // mark otp verified
  await prisma.userOtp.update({
    where: {
      id: savedOtp.id,
    },
    data: {
      verified: true,
    },
  });

  // activate user account
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      isVerified: true,
    },
  });

  // success response
  return {
    message: "OTP verified successfully",
  };

};
// login user
const loginUser = async (loginData) => {

  // get request data
  const { email, password } = loginData;

  // find user by email
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  // user not found
  if (!user) {
    return {
      message: "Invalid email or password",
    };
  }

  // user not verified
  if (!user.isVerified) {
    return {
      message: "Please verify your account first",
    };
  }

  // account locked
  if (
    user.lockedUntil &&
    user.lockedUntil > new Date()
  ) {
    return {
      message: "Account temporarily locked",
    };
  }

  // compare password with hash
  const isPasswordValid =
    await bcrypt.compare(
      password,
      user.password
    );

  // wrong password
  if (!isPasswordValid) {

    const attempts =
      user.failedLoginAttempts + 1;

    // lock account after 5 tries
    if (attempts >= 5) {

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          failedLoginAttempts: attempts,
          lockedUntil: new Date(
            Date.now() + 15 * 60 * 1000
          ),
        },
      });

      return {
        message:
          "Account locked for 15 minutes",
      };
    }

    // increase failed attempts
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        failedLoginAttempts: attempts,
      },
    });

    return {
      message: "Invalid email or password",
    };
  }

  // reset failed attempts
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  // create jwt token
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  // success response
  return {
    message: "Login successful",
    token,
  };

};
// forgot password
const forgotPassword =
  async (email) => {

    // find user
    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    // user not found
    if (!user) {
      return {
        message: "User not found",
      };
    }

    // generate otp
    const otp = Math.floor(
      100000 +
      Math.random() * 900000
    ).toString();

    // expiry time
    const expiresAt =
      new Date(
        Date.now() +
        10 * 60 * 1000
      );

    // save otp
    await prisma.userOtp.create({
      data: {
        userId: user.id,
        otp,
        purpose:
          "FORGOT_PASSWORD",
        expiresAt,
      },
    });

    // success response
    return {
      message:
        "Password reset OTP generated",
      otp,
    };

  };
  // verify reset otp
const verifyResetOtp =
  async (email, otp) => {

    // find user
    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    // user not found
    if (!user) {
      return {
        message:
          "User not found",
      };
    }

    // find otp
    const savedOtp =
      await prisma.userOtp.findFirst({
        where: {
          userId: user.id,
          purpose:
            "FORGOT_PASSWORD",
          verified: false,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    // otp missing
    if (!savedOtp) {
      return {
        message:
          "OTP not found",
      };
    }

    // otp mismatch
    if (
      savedOtp.otp !== otp
    ) {
      return {
        message:
          "Invalid OTP",
      };
    }

    // otp expired
    if (
      savedOtp.expiresAt <
      new Date()
    ) {
      return {
        message:
          "OTP expired",
      };
    }

    // mark verified
    await prisma.userOtp.update({
      where: {
        id: savedOtp.id,
      },
      data: {
        verified: true,
      },
    });

    return {
      message:
        "OTP verified successfully",
    };

  };
  // reset password
const resetPassword =
  async (
    email,
    newPassword
  ) => {

    // find user
    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    // user not found
    if (!user) {
      return {
        message:
          "User not found",
      };
    }

    // hash password
    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    // update password
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password:
          hashedPassword,
      },
    });

    // success response
    return {
      message:
        "Password reset successfully",
    };

  };
  const resendUserOtp =
  async (email) => {

    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (!user) {

      return {
        message:
          "User not found",
      };

    }

    const otp =
      Math.floor(
        100000 +
        Math.random() * 900000
      ).toString();

    const expiresAt =
      new Date(
        Date.now() +
        10 * 60 * 1000
      );

    await prisma.userOtp.create({
      data: {
        userId: user.id,
        otp,
        purpose:
          "REGISTER",
        expiresAt,
      },
    });

    return {
      message:
        "OTP resent successfully",
      otp,
    };

  };
// export service function
module.exports = {
  registerUser,
  verifyOtp,
  loginUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  resendUserOtp,
};