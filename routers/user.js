// const { Router } = require("express");
// const path = require("path");
// const multer = require("multer");
// const User = require("../models/user");
// const Blog = require("../models/blog");
// const Comment = require("../models/comments");
// const { requireUser } = require("../middlewares/authentication");

// const router = Router();

// // ====================== Public Routes ======================

// router.get("/signin", (req, res) => {
//     return res.render("signin");
// });

// router.get("/signup", (req, res) => {
//     return res.render("signup");
// });

// router.post("/signin", async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         console.log("Credentials Received:", email, password);
//         const token = await User.matchPasswordAndToken(email, password);

//         if (!token) {
//             return res.render("signin", {
//                 error: "Incorrect Email or Password",
//             });
//         }

//         console.log("Generated Token:", token);

//         return res
//             .cookie("token", token, { httpOnly: true })
//             .redirect("/");
//     } catch (error) {
//         console.error("Login Error:", error.message);

//         return res.render("signin", {
//             error: "Something went wrong. Try again.",
//         });
//     }
// });

// router.post("/signup", async (req, res) => {
//     try {
//         const { fullName, email, password } = req.body;

//         await User.create({
//             fullName,
//             email,
//             password,
//         });

//         return res.redirect("/");
//     } catch (error) {
//         console.error("Error creating user:", error.message);
//         return res.status(500).send("Internal Server Error");
//     }
// });

// router.get("/logout", (req, res) => {
//     res.clearCookie("token").redirect("/user/signin");
// });

// // =================== File Upload Setup ===================

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, path.resolve("./public/images"));
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, uniqueSuffix + path.extname(file.originalname));
//     }
// });

// const upload = multer({ storage });

// // =================== Protected Routes ===================




// router.post("/profile/updatebio", requireUser, async (req, res) => {
//     try {
//         const { bio } = req.body;

//         await User.findByIdAndUpdate(req.user._id, {
//             bio: bio.trim()
//         });

//         return res.redirect("/user/profile");
//     } catch (err) {
//         console.error("Error updating bio:", err.message);
//         return res.status(500).send("Internal Server Error");
//     }
// });

// // Toggle bio form visibility
// router.get("/profile/editbio", requireUser, async (req, res) => {
//     try {
//         const blogs = await Blog.find({ createdBy: req.user._id });
//         const comments = await Comment.find({ createdBy: req.user._id })
//             .populate("blogId")
//             .sort({ createdAt: -1 });

//         res.render("profile", {
//             user: req.user,
//             blogs,
//             comments,
//             showBioForm: true  // <- Show the bio editing form
//         });
//     } catch (err) {
//         console.error("Error loading bio edit form:", err);
//         res.status(500).send("Internal Server Error");
//     }
// });













// // View own profile
// router.get("/profile", requireUser, async (req, res) => {
//     try {
//         const blogs = await Blog.find({ createdBy: req.user._id });
//         const comments = await Comment.find({ createdBy: req.user._id })
//             .populate("blogId")
//             .sort({ createdAt: -1 });

//         res.render("profile", {
//             user: req.user,
//             blogs,
//             comments,
//             showBioForm: false // <-- Add this line

//         });
//     } catch (err) {
//         console.error("Error loading profile:", err);
//         res.status(500).send("Internal Server Error");
//     }
// });

// // Upload profile picture
// router.post("/profile", requireUser, upload.single("profileImage"), async (req, res) => {
//     try {
//         const imagePath = "/images/" + req.file.filename;

//         await User.findByIdAndUpdate(req.user._id, {
//             profileImageURL: imagePath
//         });

//         return res.redirect("/user/profile");
//     } catch (err) {
//         console.error("Error updating profile image:", err.message);
//         return res.status(500).send("Internal Server Error");
//     }
// });




// router.get("/profile/:id", async (req, res) => {
//     const userId = req.params.id;

//     try {
//         const user = await User.findById(userId);
//         if (!user) return res.status(404).send("User not found");

//         const blogs = await Blog.find({ createdBy: user._id }).sort({ createdAt: -1 });

//         const comments = await Comment.find({ createdBy: user._id })
//             .sort({ createdAt: -1 })
//             .populate("blogId"); // so we can display the blog title

//         res.render("user_profile", {
//             user,
//             blogs,
//             comments,  currentUser: req.user,
            
//             showBioForm: false // or true if editing

//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).send("Internal Server Error");
//     }
// });
















// // Update bio












// // Delete a comment
// router.post("/comment/delete/:id", requireUser, async (req, res) => {
//     try {
//         const comment = await Comment.findById(req.params.id);

//         if (!comment) return res.status(404).send("Comment not found");

//         if (String(comment.createdBy) !== String(req.user._id)) {
//             return res.status(403).send("Unauthorized");
//         }

//         await comment.deleteOne();
//         res.redirect("/user/profile");
//     } catch (err) {
//         console.error("Error deleting comment:", err);
//         res.status(500).send("Internal Server Error");
//     }
// });

// // =================== Search (Optional Public) ===================

// router.get("/search", requireUser, (req, res) => {
//     res.render("search");
// });

// // ✅ Protected AJAX route for user search
// router.get("/search-users", requireUser, async (req, res) => {
//     const { q } = req.query;

//     if (!q) return res.json([]);

//     const users = await User.find({
//         fullName: { $regex: q, $options: "i" }
//     }).select("fullName _id");

//     res.json(users);
// });

// module.exports = router;

const { Router } = require("express");
const User = require("../models/user");
const Blog = require("../models/blog");
const Comment = require("../models/comments");
const { requireUser } = require("../middlewares/authentication");
const multer = require("multer");
const { storage } = require("../utils/cloudinary"); // ✅ Cloudinary storage
const upload = multer({ storage });

const router = Router();

// ====================== Public Routes ======================

// Signin page
router.get("/signin", (req, res) => {
    return res.render("signin");
});

// Signup page
router.get("/signup", (req, res) => {
    return res.render("signup");
});

// Handle signin
router.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    try {
        const token = await User.matchPasswordAndToken(email, password);

        if (!token) {
            return res.render("signin", {
                error: "Incorrect Email or Password",
            });
        }

        return res
            .cookie("token", token, { httpOnly: true })
            .redirect("/");
    } catch (error) {
        console.error("Login Error:", error.message);
        return res.render("signin", {
            error: "Something went wrong. Try again.",
        });
    }
});

// Handle signup
router.post("/signup", async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        await User.create({
            fullName,
            email,
            password,
        });

        return res.redirect("/");
    } catch (error) {
        console.error("Error creating user:", error.message);
        return res.status(500).send("Internal Server Error");
    }
});

// Logout
router.get("/logout", (req, res) => {
    res.clearCookie("token").redirect("/user/signin");
});

// =================== Protected Routes ===================

// View own profile
router.get("/profile", requireUser, async (req, res) => {
    try {
        const blogs = await Blog.find({ createdBy: req.user._id });
        const comments = await Comment.find({ createdBy: req.user._id })
            .populate("blogId")
            .sort({ createdAt: -1 });

        res.render("profile", {
            user: req.user,
            blogs,
            comments,
            showBioForm: false
        });
    } catch (err) {
        console.error("Error loading profile:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Upload profile picture (Cloudinary)
router.post("/profile", requireUser, upload.single("profileImage"), async (req, res) => {
    try {
        const imageUrl = req.file.path;

        await User.findByIdAndUpdate(req.user._id, {
            profileImageURL: imageUrl
        });

        return res.redirect("/user/profile");
    } catch (err) {
        console.error("Error updating profile image:", err.message);
        return res.status(500).send("Internal Server Error");
    }
});

// Toggle bio edit form
router.get("/profile/editbio", requireUser, async (req, res) => {
    try {
        const blogs = await Blog.find({ createdBy: req.user._id });
        const comments = await Comment.find({ createdBy: req.user._id })
            .populate("blogId")
            .sort({ createdAt: -1 });

        res.render("profile", {
            user: req.user,
            blogs,
            comments,
            showBioForm: true
        });
    } catch (err) {
        console.error("Error loading bio edit form:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Update bio
router.post("/profile/updatebio", requireUser, async (req, res) => {
    try {
        const { bio } = req.body;

        await User.findByIdAndUpdate(req.user._id, {
            bio: bio.trim()
        });

        return res.redirect("/user/profile");
    } catch (err) {
        console.error("Error updating bio:", err.message);
        return res.status(500).send("Internal Server Error");
    }
});

// View other user's profile
router.get("/profile/:id", async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).send("User not found");

        const blogs = await Blog.find({ createdBy: user._id }).sort({ createdAt: -1 });
        const comments = await Comment.find({ createdBy: user._id })
            .sort({ createdAt: -1 })
            .populate("blogId");

        res.render("user_profile", {
            user,
            blogs,
            comments,
            currentUser: req.user,
            showBioForm: false
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

// Delete comment
router.post("/comment/delete/:id", requireUser, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) return res.status(404).send("Comment not found");

        if (String(comment.createdBy) !== String(req.user._id)) {
            return res.status(403).send("Unauthorized");
        }

        await comment.deleteOne();
        res.redirect("/user/profile");
    } catch (err) {
        console.error("Error deleting comment:", err);
        res.status(500).send("Internal Server Error");
    }
});

// =================== Search ===================

// Search page
router.get("/search", requireUser, (req, res) => {
    res.render("search");
});

// Search users (AJAX)
router.get("/search-users", requireUser, async (req, res) => {
    const { q } = req.query;

    if (!q) return res.json([]);

    const users = await User.find({
        fullName: { $regex: q, $options: "i" }
    }).select("fullName _id");

    res.json(users);
});

module.exports = router;
