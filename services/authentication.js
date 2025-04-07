// const JWT=require("jsonwebtoken");

// const secret="alligatr"

// function createTokenForUser(user){

// const payload=
// {
// _id:user.id,
// email:user.email,
// profileImageURL:user.profileImageURL,
// role:user.role
// }
// const token = JWT.sign(payload,secret);
// return token
// }

// function validateToken(token){

//     const payload=JWT.verify(token, secret)
//     return payload;
// }


// module.exports={
// createTokenForUser,validateToken

// }



const JWT = require("jsonwebtoken");
require("dotenv").config(); // make sure this line is at the top!

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET is not defined in environment variables!");
}

function createTokenForUser(user) {
  const payload = {
    _id: user.id,
    email: user.email,
    profileImageURL: user.profileImageURL,
    role: user.role,
  };
  const token = JWT.sign(payload, secret, { expiresIn: "1h" }); // optional: add expiry
  return token;
}

function validateToken(token) {
  const payload = JWT.verify(token, secret);
  return payload;
}

module.exports = {
  createTokenForUser,
  validateToken,
};

