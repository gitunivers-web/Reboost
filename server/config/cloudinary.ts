let cloudinaryConfigured = false;
let cloudinary: any = null;

if (process.env.CLOUDINARY_URL?.startsWith('cloudinary://') || 
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)) {
  
  delete process.env.CLOUDINARY_URL;
  
  try {
    const { v2 } = require('cloudinary');
    cloudinary = v2;
    
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
      });
      cloudinaryConfigured = true;
      console.log('✅ Cloudinary configured successfully');
    }
  } catch (error) {
    console.error('Failed to configure Cloudinary:', error);
  }
} else {
  delete process.env.CLOUDINARY_URL;
  console.warn('⚠️ Cloudinary configuration not found or invalid. File uploads will not work properly.');
}

export default cloudinary;
export { cloudinaryConfigured };
