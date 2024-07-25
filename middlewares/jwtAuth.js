import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";

const env = dotenv.config().parsed;

const jwtAuth = () => {
  return async (req, res, next) => {
    try {
      if (!req.headers.authorization) {
        throw {
          code: 401,
          message: "UNAUTHORIZED",
        };
      }
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jsonwebtoken.verify(token, env.ACCESS_TOKEN_SECRET);
      req.jwt = decoded;
      next();
    } catch (error) {
      const errorJWT = [
        "invalid signature",
        "jwt malformed",
        "jwt must be provided",
        "invalid token",
      ];
      if ((error.message = "jwt expired")) {
        error.message = "ACCESS_TOKEN_EXPIRED";
      } else if (errorJWT.includes(error.message)) {
        error.message = "INVALID_ACCESS_TOKEN";
      }
      return res.status(401).json({
        status: false,
        message: "UNAUTHORIZED",
      });
    }
  };
};

export default jwtAuth;
