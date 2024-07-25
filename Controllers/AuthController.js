import User from "../models/User.js";
import existingUser from "../libraries/emailExists.js";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";

const generateAccessToken = async (payload) => {
  return jsonwebtoken.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
};

const generateRefreshToken = async (payload) => {
  return jsonwebtoken.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

class AuthController {
  async register(req, res) {
    try {
      if (!req.body.fullname) {
        throw {
          code: 400,
          message: "FULLNAME_REQUIRED",
        };
      }

      if (!req.body.email) {
        throw {
          code: 400,
          message: "EMAIL_REQUIRED",
        };
      }

      if (!req.body.password) {
        throw {
          code: 400,
          message: "PASSWORD_REQUIRED",
        };
      }

      if (req.body.password.length < 6) {
        throw {
          code: 400,
          message: "PASSWORD_MINIMUM_6_CHARACTERS",
        };
      }

      const emailExists = await existingUser(req.body.email);
      if (emailExists) {
        throw {
          code: 409,
          message: "Email already exists",
        };
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(req.body.password, salt);
      const user = await User.create({
        fullname: req.body.fullname,
        email: req.body.email,
        password: hash,
      });
      if (!user) {
        throw {
          code: 500,
          message: "USER_REGISTRATION_FAILED",
        };
      }
      return res.status(200).json({
        status: true,
        message: "USER_REGISTRATION_SUCCESS",
        data: user,
      });
    } catch (error) {
      return res.status(error.code || 500).json({
        status: false,
        message: error.message,
      });
    }
  }

  async login(req, res) {
    try {
      if (!req.body.email) {
        throw {
          code: 400,
          message: "EMAIL_REQUIRED",
        };
      }

      if (!req.body.password) {
        throw {
          code: 400,
          message: "PASSWORD_REQUIRED",
        };
      }

      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        throw {
          code: 404,
          message: "USER_NOT_FOUND",
        };
      }

      const isPasswordValid = await bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!isPasswordValid) {
        throw {
          code: 401,
          message: "USER_LOGIN_FAILED",
        };
      }
      const payload = {
        id: user._id,
      };
      const accessToken = await generateAccessToken(payload);

      const refreshToken = await generateRefreshToken(payload);
      return res.status(200).json({
        status: true,
        message: "USER_LOGIN_SUCCESS",
        fullname: user.fullname,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      return res.status(error.code || 500).json({
        status: false,
        message: error.message,
      });
    }
  }

  async refreshToken(req, res) {
    try {
      if (!req.body.refreshToken) {
        throw {
          code: 400,
          message: "REFRESH_TOKEN_REQUIRED",
        };
      }

      const refreshTokens = req.body.refreshToken;

      const decoded = jsonwebtoken.verify(
        refreshTokens,
        process.env.REFRESH_TOKEN_SECRET
      );

      if (!decoded) {
        throw {
          code: 401,
          message: "REFRESH_TOKEN_INVALID",
        };
      }

      const accessToken = await generateAccessToken({
        id: decoded.id,
      });
      const refreshToken = await generateRefreshToken({
        id: decoded.id
      })

      return res.status(200).json({
        status: true,
        message: "REFRESH_TOKEN_SUCCESS",
        accessToken,
        refreshToken
      });
    } catch (error) {
      const errorJWT = [
        "invalid signature",
        "jwt malformed",
        "jwt must be provided",
        "invalid token",
      ];
      if ((error.message = "jwt expired")) {
        error.message = "REFRESH_TOKEN_EXPIRED";
      } else if (errorJWT.includes(error.message)) {
        error.message = "INVALID_REFRESH_TOKEN";
      }
      return res.status(error.code || 500).json({
        status: false,
        message: error.message,
      });
    }
  }
}

export default new AuthController();
