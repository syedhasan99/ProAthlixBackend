import express from "express";
import {
  followAndUnfollowUser,
  getAllUsers,
  myProfile,
  updatePassword,
  updateProfile,
  userFollowersAndFollowingsData,
  userProfile,
} from "../controllers/userControllers.js";
import isAuth from "../middlewares/isAuth.js";
import uploadFile from "../middlewares/multer.js";
import multer from "multer";

const upload = multer();

const router = express.Router();

router.get("/me", isAuth, myProfile);
router.get("/all", isAuth, getAllUsers);
router.get("/:id", isAuth, userProfile);
router.post("/:id", isAuth, upload.none(), updatePassword);
router.put("/:id", isAuth, uploadFile, updateProfile);
router.get("/follow/:id", isAuth, followAndUnfollowUser);
router.get("/followData/:id", isAuth, userFollowersAndFollowingsData);

export default router;
