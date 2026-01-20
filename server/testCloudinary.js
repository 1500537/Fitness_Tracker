import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";

const testCloudinary = async () => {
    try {
        console.log('Testing Cloudinary configuration...');
        console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
        console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set');
        console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set');

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true
        });

        // Test connection
        const result = await cloudinary.api.ping();
        console.log('✅ Cloudinary connection successful:', result);

        // Test upload capabilities
        const uploadTest = await cloudinary.uploader.upload(
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            {
                resource_type: "image",
                folder: "fitness_tracker/test",
                public_id: "test_upload"
            }
        );
        console.log('✅ Test upload successful:', uploadTest.secure_url);

        // Clean up test upload
        await cloudinary.uploader.destroy(uploadTest.public_id);
        console.log('✅ Test cleanup successful');

        console.log('🎉 All Cloudinary tests passed!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Cloudinary test failed:', error);
        process.exit(1);
    }
};

testCloudinary();