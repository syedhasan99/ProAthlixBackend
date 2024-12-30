import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  commentOnPost,
  deleteComment,
  deletePost,
  editCaption,
  getAllPosts,
  likeAndUnlikePost,
  newPost,
} from "../controllers/postControllers.js";
import uploadFile from "../middlewares/multer.js";

const router = express.Router();

router.post("/new", isAuth, uploadFile, newPost);
router.put("/:id", isAuth, editCaption);
router.delete("/:id", isAuth, deletePost);
router.get("/getAllPosts", isAuth, getAllPosts);

router.post("/like/:id", isAuth, likeAndUnlikePost);

router.post("/comment/:id", isAuth, commentOnPost);
router.delete("/comment/:id", isAuth, deleteComment);

export default router;
