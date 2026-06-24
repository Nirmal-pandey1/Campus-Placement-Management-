const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "careersync/resumes",
    allowed_formats: ["pdf", "doc", "docx"],
    resource_type: "raw",
  },
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "careersync/images",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const uploadResume = multer({ storage: resumeStorage });
const uploadImage  = multer({ storage: imageStorage });

module.exports = { cloudinary, uploadResume, uploadImage };