const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Blog = require("../models/blog");
const Comment = require("../models/comments");

const { requireUser } = require("../middlewares/authentication"); // ✅ import middleware

const router = Router();

// ✅ Show Add Blog Form (only for logged-in users)
router.get("/add-new", requireUser, (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

// ✅ View a single blog
router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: req.params.id }).populate("createdBy");
  
  return res.render("blog.ejs", {
    user: req.user,
    blog,
    comments
  });
});

// ✅ Setup multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.resolve(`./public/uploads/${req.user._id}`);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

// ✅ Handle blog submission (only for logged-in users)
router.post("/", requireUser, upload.single("coverImage"), (req, res) => {
  const { title, body } = req.body;

  Blog.create({
    title,
    body,
    createdBy: req.user._id,
    coverImageURL: `/uploads/${req.user._id}/${req.file.filename}`,
  })
    .then((blog) => {
      return res.redirect(`/blog/${blog._id}`);
    })
    .catch((err) => {
      console.error("Error creating blog:", err);
      return res.status(500).send("Internal Server Error");
    });
});

// ✅ Post a comment (only for logged-in users)
router.post("/comment/:blogId", requireUser, async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id
  });
  
  return res.redirect(`/blog/${req.params.blogId}`);
});

// ✅ Delete blog (only by owner)
router.post("/delete/:id", requireUser, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) return res.status(404).send("Blog not found");

    if (String(blog.createdBy) !== String(req.user._id)) {
      return res.status(403).send("Unauthorized");
    }

    await blog.deleteOne();
    res.redirect("/user/profile");
  } catch (err) {
    console.error("Error deleting blog:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
