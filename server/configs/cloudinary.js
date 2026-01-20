import { v2 as cloudinary } from "cloudinary";

const connectCloudinary = async () => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true
        });
        
        console.log('Cloudinary configured successfully');
        console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
        
        // Test connection
        const result = await cloudinary.api.ping();
        console.log('Cloudinary connection test:', result);
        
    } catch (error) {
        console.error('Cloudinary configuration error:', error);
        throw error;
    }
}

export default connectCloudinary;