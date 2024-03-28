import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler"
import config from "../config.js";

export const isAuthorized = asyncHandler(async (req, res, next) => {
    // console.log(req.cookies);
    // Check for the existence of a token in the cookie
    // We are looking for a cookie called jwt.
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      res
        .status(401)
        .json({ message: "You are unauthorized to view this resource" });
    }
    const token = authHeader?.split(" ")[1];
    // const tokenCookie = req.cookies.jwt;
    // if (tokenCookie) {
    //   try {
    //     const decoded = jwt.verify(tokenCookie, process.env.JWT_SECRET);
    //     console.log(decoded);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }
    try {
      const decoded = jwt.verify(token || "", config.access_token_secret); 
      if (!decoded.userId) {
        res
        .status(403)
        .json({ message: "You are unauthorized to view this resource" });
      }
      req.userId = decoded.userId;
      next();
    } catch (error) {
      res.status(403).json({ message: "Not authorized, invalid token" });
    }
  });