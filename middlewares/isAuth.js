import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "You are not authorized" });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SEC);

    if (!decodedData) {
      return res.status(400).json({ message: "Token Expired!" });
    }

    req.user = await User.findById(decodedData.id);
    next();
  } catch (error) {
    res.status(error.status).json({ message: error.message });
  }
};

export default isAuth;
