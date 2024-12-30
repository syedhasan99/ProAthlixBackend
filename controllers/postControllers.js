import { Post } from "../models/Post.js";
import TryCatch from "../utils/Trycatch.js";
import getDataUrl from "../utils/urlGenerator.js";
import cloudinary from "cloudinary";

export const newPost = TryCatch(async (req, res) => {
  const { caption } = req.body;

  const ownerId = req.user._id;

  const file = req.file;
  const fileUrl = getDataUrl(file);

  let option;

  const type = req.query.type;
  if (type === "reel") {
    option = {
      resource_type: "video",
    };
  } else {
    option = {};
  }

  const myCloud = await cloudinary.v2.uploader.upload(fileUrl.content, option);

  const post = await Post.create({
    caption,
    owner: ownerId,
    post: {
      id: myCloud.public_id,
      url: myCloud.secure_url,
    },
    type,
  });

  res.status(201).json({
    message: "Post created successfully",
    post,
  });
});

export const deletePost = TryCatch(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  if (post.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  await cloudinary.v2.uploader.destroy(post.post.id);

  await post.deleteOne();

  res.status(200).json({ message: "Post deleted successfully" });
});

export const getAllPosts = TryCatch(async (req, res) => {
  const posts = await Post.find({ type: "post" })
    .sort({ createdAt: -1 })
    .populate("owner", "-password");

  const reels = await Post.find({ type: "reel" })
    .sort({ createdAt: -1 })
    .populate("owner", "-password");

  res.status(200).json({ posts, reels });
});

export const likeAndUnlikePost = TryCatch(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  if (post.likes.includes(req.user._id)) {
    // logic to unlike existing like
    const likeIndex = post.likes.indexOf(req.user._id);
    post.likes.splice(likeIndex, 1);

    await post.save();
    res.status(200).json({ message: "Unliked post" });
  } else {
    // logic to like new post
    post.likes.push(req.user._id);

    await post.save();
    res.status(200).json({ message: "Liked post" });
  }
});

export const commentOnPost = TryCatch(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const { comment } = req.body;
  if (!comment) {
    return res.status(400).json({ message: "Comment cannot be empty" });
  }

  post.comments.push({
    user: req.user._id,
    name: req.user.name,
    comment,
  });

  await post.save();
  res.status(200).json({ message: "Commented on post" });
});

export const deleteComment = TryCatch(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  if (!req.body.commentId) {
    return res.status(400).json({ message: "Comment ID is required" });
  }

  const commentIndex = post.comments.findIndex(
    (c) => c._id.toString() === req.body.commentId.toString()
  );

  if (commentIndex == -1) {
    return res.status(404).json({ message: "Comment not found" });
  }

  // Only post owner and comment owner can delete his comments.
  if (
    post.owner.toString() === req.user._id.toString() ||
    post.comments[commentIndex].user.toString() === req.user._id.toString()
  ) {
    post.comments.splice(commentIndex, 1);
    await post.save();
    return res.status(200).json({ message: "Comment deleted successfully" });
  } else {
    return res.status(403).json({ message: "You are not authorized." });
  }
});

export const editCaption = TryCatch(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  if (post.owner.toString() === req.user._id.toString()) {
    post.caption = req.body.caption;
    await post.save();
    return res.status(200).json({ message: "Caption edited successfully" });
  } else {
    return res.status(403).json({ message: "You are not authorized." });
  }
})