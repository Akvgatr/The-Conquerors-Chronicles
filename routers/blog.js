const { Router } = require("express");
const multer = require("multer");
const Blog = require("../models/blog");
const Comment = require("../models/comments");

const { requireUser } = require("../middlewares/authentication");
const { storage } = require("../utils/cloudinary"); // ✅ cloudinary storage
const upload = multer({ storage });

const router = Router();

// ✅ Show Add Blog Form (only for logged-in users)
router.get("/add-new", requireUser, (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: req.params.id }).populate("createdBy");
  
  return res.render("blog.ejs", {
    user: req.user,
    blog,
    comments
  });
});

router.post("/", requireUser, upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;

  try {
    const blog = await Blog.create({
      title,
      body,
      createdBy: req.user._id,
      coverImageURL: req.file.path, // ✅ Cloudinary URL
    });

    res.redirect(`/blog/${blog._id}`);
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).send("Internal Server Error");
  }
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
