const crypto = require("crypto");

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
  //const posts = await Posts.find({ createdBy: userId }).sort("-createdAt");
  const posts = await Posts.find({}).sort("-createdAt");

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

  const { image, content, category, userID } = req.body;

  if (!image || !content || !category || !userID) {
    return res.status(400).json({ msg: "Input fields shouldn't be empty" });
  }

  if (userId !== userID) {
    return res.status(401).json({ msg: "not allowed to edit" });
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

//6. comments===============================================================:

const postComments = async (req, res) => {
  const postId = req.params.id;

  const { comment } = req.body;
  if (!comment) {
    return res.status(400).json({ msg: "please leave a comment" });
  }

  //work on the date for the comment:
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const day = new Date().getDate();
  const month = new Date().getMonth();
  const adjustedMonth = months[month];
  console.log("Month:", month);

  const date = new Date();
  const year = new Date().getFullYear();

  const commentDate = `${day}-${adjustedMonth}-${year} ${date.toLocaleTimeString()}`;
  console.log("Date comment was made:", commentDate);

  try {
    const post = await Posts.findOne({ _id: postId });
    if (!post) {
      return res.status(404).json({ msg: `no post with id: ${postId}` });
    }
    // creating an id for the comments cause mongodb wont.
    //Generate a uniqueId:
    
    const customizedID = crypto.randomBytes(12).toString("hex");
    console.log(customizedID)


    post.comments.push({
      comments:comment,
      timeOfComment: commentDate,
      userId: req.user.userId,
      name: req.user.name,
      commentIDBYCRYPTO:customizedID  
    });

    await post.save();

    res.status(201).json({ msg: "comment added", post });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }

  res.status(201).json({ msg: commentDate });
};

//7. getComments===============================================================:
//this works just like getSinglePost.
const getComments = async(req,res)=>{
  const postId = req.params.id;
  const userID = req.user.userId;
  //postID: 66a77c2901509e3181ecb8a9
  try{
    const post = await Posts.findOne({_id:postId});
    if(!post){
      return res.status(404).json(`no post with id: ${postId}`)
    };

    const comments = post.comments
    console.log(comments);
    // const getSingleComment = post.comments.filter((comment)=>{
    //    return comment.userId === userID
    // })
    // console.log(getSingleComment);
    res.status(200).json({comments:comments})
  }catch(error){
    console.log(error)
    res.status(500).json(error)
  };
}

module.exports = {
  upLoadImage,
  postContent,
  getPosts,
  getSinglePost,
  editPost,
  deletePost,
  postComments,
  getComments
};
