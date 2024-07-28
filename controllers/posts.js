const Posts = require("../models/Posts");

const cloudinary = require("cloudinary").v2;
const fs = require("fs");

//1. upLoadImage=================================================:
const upLoadImage = async (req, res) => {
  console.log(req.files.image.tempFilePath);

  try {
    if (!req.files) {
      return res.status(400).json({ msg: "No files uploaded" });
    }

    const maxSize = 1024 * 1024;
    if (req.files.image.size > maxSize) {
      return res
        .status(400)
        .json({ msg: "Please upload image smaller than 1mb" });
    }
    //console.log(req.files.image);

    //console.log(req.files.image.tempFilePath);
    console.log("Image hitting cloudinary...");

    const result = await cloudinary.uploader.upload(
      req.files.image.tempFilePath,
      {
        use_filename: true,
        folder: "hospytaContent",
      }
    );

    console.log("Image sent to cloudinary...");
    fs.unlinkSync(req.files.image.tempFilePath);

    console.log("Image unSynced...");

    res
      .status(200)
      .json({ msg: { src: result.secure_url, publicID: result.public_id } });

    return result.secure_url; //This is where the function returns the URL of the uploaded image.
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error });
  }
};

//2. postContent===============================================================:

const postContent = async (req, res) => {
  const userId = req.user.userId;

  const { image, content, category } = req.body;

  console.log(image, content, category);

  try {
    if (!image || !content || !category) {
      return res.status(400).json({ msg: "Please fill out the inputs" });
    }

    const createdPost = {
      image: image,
      content: content,
      category: category,
      createdBy: userId,
    };

    const post = await Posts.create(createdPost);
    res.status(201).json({ msg: "post created", post });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error });
  }
};

//3. getPosts===============================================================:

const getPosts = async (req, res) => {
  const userId = req.user.userId;
  const posts = await Posts.find({ createdBy: userId }).sort("-createdAt");

  console.log(posts);
  res.status(200).json({ posts, nbhits: posts.length });
};

//3. getSinglePost===============================================================:

const getSinglePost = async (req, res) => {
  const postId = req.params.id;
  console.log("This is the postId:", postId);

  try {
    const userId = req.user.userId;
    const post = await Posts.findOne({
      _id: postId,
      createdBy: userId,
    });
    if (!post) {
      return res.status(404).json({ msg: `No post with id: ${postId}` });
    }
    res.status(200).json({ post });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error });
  }
};

//4. editPost===============================================================:
const editPost = async (req, res) => {
  const userId = req.user.userId;
  const postId = req.params.id;

  const { image, content, category } = req.body;

  if (!image || !content || !category) {
    return res.status(400).json({ msg: "Input fields shouldn't be empty" });
  }

  try {
    const editedPost = await Posts.findOneAndUpdate(
      { _id: postId, createdBy: userId },
      {
        image: image,
        content: content,
        category: category,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({ msg: "post updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error });
  }
};

//5. deletePost====================================================================
const deletePost = async (req, res) => {
  const userId = req.user.userId;
  const postId = req.params.id;

  try {
    const post = await Posts.findOneAndRemove({
      _id: postId,
      createdBy: userId,
    });
    if (!post) {
      return res.status(404).json({ msg: `no post found with id: ${postId}` });
    }

    res.status(200).json({ msg: "post deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

module.exports = {
  upLoadImage,
  postContent,
  getPosts,
  getSinglePost,
  editPost,
  deletePost,
};
