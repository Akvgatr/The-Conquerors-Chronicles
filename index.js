const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const userRoute = require("./routers/user");
const blogRoute = require("./routers/blog");

const cookieParser = require("cookie-parser");
const { checkForAuthenticationCookie, requireUser } = require("./middlewares/authentication");

const Blog = require('./models/blog');

const app = express();
const PORT = 8000;

// mongoose.connect("mongodb://localhost:27017/bloggatr").then(() => console.log("MongoDB connected"));
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/bloggatr")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));









app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token")); // 👈 Applies to all routes

app.use(express.static(path.resolve('./public')));

// Set the user globally in views
app.use((req, res, next) => {
    res.locals.user = req.user;
    console.log("User in route:", req.user);
    next();
});

// Public Home Page
app.get("/", async (req, res) => {
    const allBlogs = await Blog.find().sort({ createdAt: -1 });
    res.render("home.ejs", {
        user: req.user,
        blogs: allBlogs
    });
});

// Routes
app.use("/user", userRoute);
app.use("/blog", blogRoute);

// 👇 Protected Route: My Blogs
app.get("/myblogs", requireUser, async (req, res) => {
    try {
        const blogs = await Blog.find({ createdBy: req.user._id }).sort({ createdAt: -1 });

        res.render("myblogs", {
            user: req.user,
            blogs,
        });
    } catch (err) {
        console.error("Error fetching user's blogs:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(PORT, () => console.log(`Server started at ${PORT}`));
