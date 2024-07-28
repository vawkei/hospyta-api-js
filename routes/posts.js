const express = require("express");
const router = express.Router();
const { upLoadImage, postContent, getPosts, getSinglePost, editPost, deletePost } = require("../controllers/posts");
const { authenticateUser } = require("../middleware/authentication");

router.post("/uploadImage",authenticateUser, upLoadImage);
router.post("/postContent", authenticateUser, postContent);
router.get("/getPosts", authenticateUser, getPosts);
router.get("/getPosts/:id", authenticateUser, getSinglePost);
router.patch("/editPost/:id",authenticateUser, editPost);
router.delete("getPosts/:id",authenticateUser,deletePost);

module.exports = router;
