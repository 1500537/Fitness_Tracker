import multer from "multer";

// Use memory storage to keep files in buffer for Cloudinary upload
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit for videos
        files: 1 // Only one file at a time
    },
    fileFilter: (req, file, cb) => {
        // Allow comprehensive media types
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
            'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov',
            'video/wmv', 'video/flv', 'video/mkv'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type: ${file.mimetype}. Only images and videos are allowed.`), false);
        }
    }
});

export default upload;