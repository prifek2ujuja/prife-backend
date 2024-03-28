import jwt from "jsonwebtoken";
import config from "../../config.js";

const generateToken = (userInfo: {userId: any, role: string}) => {
  return jwt.sign(userInfo, config.access_token_secret, {
    expiresIn: "2h",
  });
};

const generateRefreshToken = (userInfo: {userId: any, role: string}) => {
  return jwt.sign(userInfo, config.refresh_token_secret, {
    expiresIn: "24h",
  });
};

export { generateToken, generateRefreshToken }; 