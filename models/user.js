const {Schema,model}= require('mongoose')
const {createHmac,randomBytes}=require("crypto");
const { createTokenForUser } = require('../services/authentication');
const userSchema =new Schema({
    fullName:{

        type:String,
        required:true
    },
    email:{

        type:String,
        required:true,
        unique:true
    },

    salt:{
type:String,
default: () => randomBytes(16).toString("hex")  // Generates a random salt

    },
    role:{
type:String,
enum:["USER","ADMIN"],
default:"USER"

    }
    
    
    
    
    
    ,bio: {
        type: String,
        default: ''
    },











    

    profileImageURL:{
type:String,
default:"/images/default.png"

    },
    password:{

        type:String,
        required:true
    },
},{timestamps:true}
)



userSchema.pre("save", function (next) {
    const user = this;
    if (!user.isModified("password")) return next();  // 🛠️ Fix missing return

    const salt = randomBytes(16).toString("hex");  // 🛠️ Ensure correct encoding
    const hashedPassword = createHmac("sha256", salt)
        .update(user.password)
        .digest("hex");

    user.salt = salt;  
    user.password = hashedPassword;

    next();  
});


userSchema.static('matchPasswordAndToken', async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) return null;

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac("sha256", salt)
        .update(password)
        .digest("hex");

    console.log("Stored Hashed Password:", hashedPassword);
    console.log("User Provided Hash:", userProvidedHash);

    if (hashedPassword !== userProvidedHash) return null;

    const token = createTokenForUser(user);
    return token;
});






const User=model('user',userSchema)
module.exports=User;