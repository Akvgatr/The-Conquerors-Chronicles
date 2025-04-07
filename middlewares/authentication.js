const jwt = require("jsonwebtoken");
const User = require("../models/user");

function checkForAuthenticationCookie(cookieName) {
    return async (req, res, next) => {
        const token = req.cookies[cookieName];
        if (!token) {
            req.user = null;
            return next();
        }

        try {
            const decoded = jwt.verify(token, "alligatr"); // Use the correct secret key
            req.user = await User.findById(decoded._id);
            
            if (!req.user) {
                req.user = null;
            }

            console.log("Authenticated User:", req.user); // Debugging

        } catch (err) {
            console.error("JWT Verification Error:", err.message);
            req.user = null;
        }

        next();
    };
}

function requireUser(req, res, next) {
    if (!req.user) {
      return res.redirect("/user/signin");
    }
    next();
  }

module.exports = { checkForAuthenticationCookie ,requireUser};
