const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
    cloud_name: "drd4aughi",
    api_key: "568356461197998",
    api_secret: "v2m2u8isSLO3UmcA_hRxfy8rTIM",
  });

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "blogApp", // Optional folder name in your Cloudinary account
    allowed_formats: ["jpeg", "png", "jpg", "webp", "avif"],
    transformation: [{ width: 800, height: 600, crop: "limit" }],
  },
});

module.exports = { cloudinary, storage };
