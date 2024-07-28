const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: [true, "Please add an image"],
      default: "https://i.ibb.co/4pDNDk1/avatar.png",
    },
    content: {
      type: String,
      trim: true,
      required: [true, "please add a content"],
      minlength: [10, "characters shouldn't be less than 10"],
      //maxlength: [120, "characters shouldn't be more than 120"],
    },
    category: {
      type: String,
      trim: true,
      required: [true, "please add a category"],
    },
    postViews:{
      viewCount:{
        type:Number,
        default:0
      }
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: [true, "Please provide a user"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Posts", PostSchema);
