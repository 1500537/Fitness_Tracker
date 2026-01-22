import { v2 as cloudinary } from "cloudinary";

const connectCloudinary = async () => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true
        });
        
        if (process.env.NODE_ENV === 'development') {
            console.log('Cloudinary configured successfully');
        }
        
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Cloudinary configuration error:', error);
        }
        throw error;
    }
}

export default connectCloudinary;