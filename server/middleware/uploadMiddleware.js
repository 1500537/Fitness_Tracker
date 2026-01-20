import multer from "multer";

// Use memory storage to keep files in buffer for Cloudinary upload
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
        files: 1, // Only one file at a time
        fieldSize: 100 * 1024 * 1024 // 100MB field size
    },
    fileFilter: (req, file, cb) => {
        console.log('File filter check:', { name: file.originalname, type: file.mimetype, size: file.size });
        
        // Allow comprehensive media types including GIFs
        const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
            'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov',
            'video/wmv', 'video/flv', 'video/mkv', 'video/quicktime'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            console.log('File type accepted:', file.mimetype);
            cb(null, true);
        } else {
            console.log('File type rejected:', file.mimetype);
            cb(new Error(`Invalid file type: ${file.mimetype}. Only images and videos are allowed.`), false);
        }
    }
});

// Error handling middleware for multer
export const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        console.error('Multer error:', error);
        
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 100MB.'
            });
        }
        
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Only one file allowed.'
            });
        }
        
        return res.status(400).json({
            success: false,
            message: `Upload error: ${error.message}`
        });
    }
    
    if (error) {
        console.error('Upload error:', error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    next();
};

export default upload;