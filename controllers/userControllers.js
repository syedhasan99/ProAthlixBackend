import { User } from "../models/User.js";
import TryCatch from "../utils/Trycatch.js";
import getDataUrl from "../utils/urlGenerator.js";
import cloudinary from "cloudinary";
import bcrypt from "bcrypt";

export const myProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.status(200).json(user);
});

export const userProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user)
    return res.status(404).json({ message: "No user with this ID exists" });
  res.status(200).json(user);
});

export const followAndUnfollowUser = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id);
  const loggedUser = await User.findById(req.user._id);

  if (!user)
    return res.status(404).json({ message: "No user with this ID exists" });

  if (loggedUser._id.toString() == user._id.toString())
    return res.status(400).json({ message: "You cannot follow youself." });

  if (loggedUser.followings.includes(user._id)) {
    // logic to unfollow existing following user
    const followingIndex = loggedUser.followings.indexOf(user._id);
    const followerIndex = user.followers.indexOf(loggedUser._id);

    loggedUser.followings.splice(followingIndex, 1);
    user.followers.splice(followerIndex, 1);

    await loggedUser.save();
    await user.save();

    res.status(200).json({ message: "User unfollowed successfully" });
  } else {
    // logic to follow
    loggedUser.followings.push(user._id);
    user.followers.push(loggedUser._id);

    await loggedUser.save();
    await user.save();

    res.status(200).json({ message: "User followed successfully" });
  }
});

export const userFollowersAndFollowingsData = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("followers", "-password")
    .populate("followings", "-password");

  const followers = user.followers;
  const followings = user.followings;

  if (!user) {
    return res.status(404).json({ message: "No user with this ID exists" });
  }
  res.status(200).json({ followers, followings });
});

export const updateProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);

  const { name } = req.body;

  if (name) {
    user.name = name;
  }

  const file = req.file;

  if (file) {
    const fileUrl = getDataUrl(file);

    await cloudinary.v2.uploader.destroy(user.profilePic.id);

    const myCloud = await cloudinary.v2.uploader.upload(fileUrl.content);

    user.profilePic.id = myCloud.public_id;
    user.profilePic.url = myCloud.secure_url;
  }

  await user.save();
  res.status(200).json({ message: "Profile updated successfully", user });
});

export const updatePassword = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);

  const { oldPassword, newPassword } = req.body;

  const comparePassword = await bcrypt.compare(oldPassword, user.password);

  if (!comparePassword) {
    return res.status(400).json({ message: "Wrong old password" });
  }

  user.password = await bcrypt.hash(newPassword, 10);

  await user.save();
  res.status(200).json({ message: "Password updated successfully" });
});

export const getAllUsers = TryCatch(async (req, res) => {
  const search = req.query.search || "";

  // PTN
  const users = await User.find({
    name: {
      $regex: search,
      $options: "i",
    },
    _id: { $ne: req.user._id },
  }).select("-password");
  res.status(200).json(users);
});
