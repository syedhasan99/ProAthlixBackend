import { Chat } from "../models/chatModel.js";
import { Messages } from "../models/Messages.js";
import TryCatch from "../utils/Trycatch.js";

export const sendMessage = TryCatch(async (req, res) => {
  const { recieverId, message } = req.body;

  const senderId = req.user._id;

  if (!recieverId) {
    return res.status(400).json({ message: "Reciever ID is required" });
  }

  let chat = await Chat.findOne({
    users: { $all: [recieverId, senderId] },
  });
  if (!chat) {
    chat = new Chat({
      users: [recieverId, senderId],
      latestMessage: {
        text: message,
        sender: senderId,
      },
    });

    await chat.save();
  }

  const newMessage = new Messages({
    chatId: chat._id,
    text: message,
    sender: senderId,
  });

  await newMessage.save();

  await chat.updateOne({
    latestMessage: {
      text: message,
      sender: senderId,
    },
  });

  res.status(201).json({ message: "Message sent successfully", newMessage });
});

export const getAllMessages = TryCatch(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const chat = await Chat.findOne({
    users: { $all: [userId, id] },
  });

  if (!chat) {
    return res.status(404).json({ message: "No Chat with this user." });
  }

  const messages = await Messages.find({
    chatId: chat._id,
  });

  res.status(200).json(messages);
});

export const getAllChats = TryCatch(async (req, res) => {
  // TODO:
  const chats = await Chat.find({
    users: req.user._id,
  }).populate({
    path: "users",
    select: "name profilePic",
  });

  chats.forEach((chat) => {
    chat.users = chat.users.filter(
      (user) => user._id.toString() !== req.user._id.toString()
    );
  });

  res.status(200).json(chats);
});
