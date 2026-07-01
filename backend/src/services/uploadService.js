const cloudinary = require('../config/cloudinary');
const { apiError } = require('../utils/apiError');

const uploadImageToCloudinary = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'recover-ai' },
      (error, result) => {
        if (error) {
          return reject(new apiError('Cloudinary upload failed', 500));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
};

module.exports = {
  uploadImageToCloudinary
};
