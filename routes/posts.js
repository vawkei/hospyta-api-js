const express = require("express");
const router = express.Router();
const {
  upLoadImage,
  postContent,
  getPosts,
  getSinglePost,
  editPost,
  deletePost,
  postComments,
  getComments,
} = require("../controllers/posts");
const { authenticateUser } = require("../middleware/authentication");

router.post("/uploadImage", authenticateUser, upLoadImage);
router.post("/postContent", authenticateUser, postContent);
router.get("/getPosts", authenticateUser, getPosts);
router.get("/getPosts/:id", authenticateUser, getSinglePost);
router.patch("/editPost/:id", authenticateUser, editPost);
router.delete("getPosts/:id", authenticateUser, deletePost); //id of the post
router.patch("/postComments/:id", authenticateUser, postComments); // id of the post
router.get("/getComments/:id", authenticateUser, getComments); //id of the post

module.exports = router;
