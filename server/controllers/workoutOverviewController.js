import { AdminDrill, Category } from '../models/workoutModal.js';
import { v2 as cloudinary } from 'cloudinary';

// ===== ADMIN DRILLS =====

// Get all admin drills
export const getAllAdminDrills = async (req, res) => {
    try {
        const drills = await AdminDrill.find({ isActive: true })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            drills: drills.map(drill => ({
                _id: drill._id,
                name: drill.name,
                category: drill.category,
                tag: drill.tag,
                notes: drill.notes,
                videoUrl: drill.videoUrl,
                mediaType: drill.mediaType,
                pricing: drill.pricing,
                createdAt: drill.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching admin drills:', error);
        res.json({ success: false, message: error.message });
    }
};

// Create admin drill
export const createAdminDrill = async (req, res) => {
    try {
        const { name, category, tag, notes, videoUrl, pricing, mediaType, mediaPublicId } = req.body;

        // Validation
        if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 100) {
            return res.json({ success: false, message: 'Drill name must be 2-100 characters' });
        }
        if (!category || typeof category !== 'string' || category.trim().length < 2) {
            return res.json({ success: false, message: 'Category is required' });
        }

        // Validate that category exists
        const existingCategory = await Category.findOne({
            name: category.trim().toUpperCase(),
            isActive: true
        });

        if (!existingCategory) {
            return res.json({
                success: false,
                message: `Category "${category.trim().toUpperCase()}" does not exist. Please create the category first.`
            });
        }

        // Check if drill with same name already exists in this category
        const existingDrill = await AdminDrill.findOne({
            name: name.trim().toUpperCase(),
            category: category.trim().toUpperCase(),
            isActive: true
        });

        if (existingDrill) {
            return res.json({
                success: false,
                message: `Drill "${name.trim().toUpperCase()}" already exists in category "${category.trim().toUpperCase()}"`
            });
        }

        const drillData = {
            name: name.trim().toUpperCase(),
            category: category.trim().toUpperCase(),
            tag: tag ? tag.trim().toUpperCase() : 'GENERAL',
            notes: notes ? notes.trim() : '',
            videoUrl: videoUrl ? videoUrl.trim() : '',
            mediaType: mediaType || null,
            mediaPublicId: mediaPublicId || '',
            pricing: pricing || 'Starter',
            createdBy: 'admin'
        };

        const drill = new AdminDrill(drillData);
        await drill.save();

        // Emit real-time update
        if (req.io) {
            req.io.to('workouts').emit('drillCreated', {
                _id: drill._id,
                name: drill.name,
                category: drill.category,
                tag: drill.tag,
                notes: drill.notes,
                videoUrl: drill.videoUrl,
                mediaType: drill.mediaType,
                pricing: drill.pricing,
                createdAt: drill.createdAt
            });
        }

        res.json({
            success: true,
            drill: {
                _id: drill._id,
                name: drill.name,
                category: drill.category,
                tag: drill.tag,
                notes: drill.notes,
                videoUrl: drill.videoUrl,
                mediaType: drill.mediaType,
                pricing: drill.pricing,
                createdAt: drill.createdAt
            },
            message: `Drill "${drill.name}" created successfully`
        });
    } catch (error) {
        console.error('Error creating drill:', error);
        res.json({ success: false, message: error.message });
    }
};

// Update admin drill
export const updateAdminDrill = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, tag, notes, videoUrl, pricing, mediaType, mediaPublicId } = req.body;

        // Validation
        if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 100) {
            return res.json({ success: false, message: 'Drill name must be 2-100 characters' });
        }
        if (!category || typeof category !== 'string' || category.trim().length < 2) {
            return res.json({ success: false, message: 'Category is required' });
        }

        // Validate that category exists
        const existingCategory = await Category.findOne({
            name: category.trim().toUpperCase(),
            isActive: true
        });

        if (!existingCategory) {
            return res.json({
                success: false,
                message: `Category "${category.trim().toUpperCase()}" does not exist.`
            });
        }

        const updateData = {
            name: name.trim().toUpperCase(),
            category: category.trim().toUpperCase(),
            tag: tag ? tag.trim().toUpperCase() : 'GENERAL',
            notes: notes ? notes.trim() : '',
            videoUrl: videoUrl ? videoUrl.trim() : '',
            mediaType: mediaType || null,
            mediaPublicId: mediaPublicId || '',
            pricing: pricing || 'Starter'
        };

        const updatedDrill = await AdminDrill.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedDrill) {
            return res.json({ success: false, message: 'Drill not found' });
        }

        // Emit real-time update
        if (req.io) {
            req.io.to('workouts').emit('drillUpdated', {
                _id: updatedDrill._id,
                name: updatedDrill.name,
                category: updatedDrill.category,
                tag: updatedDrill.tag,
                notes: updatedDrill.notes,
                videoUrl: updatedDrill.videoUrl,
                mediaType: updatedDrill.mediaType,
                pricing: updatedDrill.pricing,
                createdAt: updatedDrill.createdAt
            });
        }

        res.json({
            success: true,
            drill: {
                _id: updatedDrill._id,
                name: updatedDrill.name,
                category: updatedDrill.category,
                tag: updatedDrill.tag,
                notes: updatedDrill.notes,
                videoUrl: updatedDrill.videoUrl,
                mediaType: updatedDrill.mediaType,
                pricing: updatedDrill.pricing,
                createdAt: updatedDrill.createdAt
            },
            message: `Drill "${updatedDrill.name}" updated successfully`
        });
    } catch (error) {
        console.error('Error updating drill:', error);
        res.json({ success: false, message: error.message });
    }
};

// Delete admin drill (soft delete)
export const deleteAdminDrill = async (req, res) => {
    try {
        const { id } = req.params;

        const drill = await AdminDrill.findById(id);
        if (!drill) {
            return res.json({ success: false, message: 'Drill not found' });
        }

        if (!drill.isActive) {
            return res.json({ success: false, message: 'Drill is already deleted' });
        }

        // Delete from Cloudinary if media exists
        if (drill.mediaPublicId) {
            try {
                await cloudinary.uploader.destroy(drill.mediaPublicId);
            } catch (cloudinaryError) {
                console.error('Error deleting from Cloudinary:', cloudinaryError);
            }
        }

        // Soft delete
        drill.isActive = false;
        await drill.save();

        // Emit real-time update
        if (req.io) {
            req.io.to('workouts').emit('drillDeleted', id);
        }

        res.json({
            success: true,
            message: `Drill "${drill.name}" deleted successfully`
        });
    } catch (error) {
        console.error('Error deleting drill:', error);
        res.json({ success: false, message: error.message });
    }
};

// ===== CATEGORIES =====

// Get all categories
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ createdAt: -1 });
        res.json({
            success: true,
            categories: categories.map(cat => ({
                _id: cat._id,
                name: cat.name,
                description: cat.description,
                color: cat.color,
                icon: cat.icon,
                createdAt: cat.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.json({ success: false, message: error.message });
    }
};

// Create category
export const createCategory = async (req, res) => {
    try {
        const { name, description, color, icon } = req.body;

        // Validation
        if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 50) {
            return res.json({ success: false, message: 'Category name must be 2-50 characters' });
        }

        // Check if category already exists
        const existingCategory = await Category.findOne({
            name: name.trim().toUpperCase(),
            isActive: true
        });
        if (existingCategory) {
            return res.json({ success: false, message: 'Category already exists' });
        }

        const categoryData = {
            name: name.trim().toUpperCase(),
            description: description ? description.trim() : '',
            color: color || '#FF7222',
            icon: icon || 'Dumbbell',
            createdBy: 'admin'
        };

        const category = new Category(categoryData);
        await category.save();

        // Emit real-time update
        if (req.io) {
            req.io.to('categories').emit('categoryCreated', {
                _id: category._id,
                name: category.name,
                description: category.description,
                color: category.color,
                icon: category.icon,
                createdAt: category.createdAt
            });
        }

        res.json({
            success: true,
            category: {
                _id: category._id,
                name: category.name,
                description: category.description,
                color: category.color,
                icon: category.icon,
                createdAt: category.createdAt
            },
            message: 'Category created successfully'
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.json({ success: false, message: error.message });
    }
};

// Update category
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, color, icon } = req.body;

        // Validation
        if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 50) {
            return res.json({ success: false, message: 'Category name must be 2-50 characters' });
        }

        const updateData = {
            name: name.trim().toUpperCase(),
            description: description ? description.trim() : '',
            color: color || '#FF7222',
            icon: icon || 'Dumbbell'
        };

        const updatedCategory = await Category.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedCategory) {
            return res.json({ success: false, message: 'Category not found' });
        }

        // Emit real-time update
        if (req.io) {
            req.io.to('categories').emit('categoryUpdated', {
                _id: updatedCategory._id,
                name: updatedCategory.name,
                description: updatedCategory.description,
                color: updatedCategory.color,
                icon: updatedCategory.icon,
                createdAt: updatedCategory.createdAt
            });
        }

        res.json({
            success: true,
            category: {
                _id: updatedCategory._id,
                name: updatedCategory.name,
                description: updatedCategory.description,
                color: updatedCategory.color,
                icon: updatedCategory.icon,
                createdAt: updatedCategory.createdAt
            },
            message: 'Category updated successfully'
        });
    } catch (error) {
        console.error('Error updating category:', error);
        res.json({ success: false, message: error.message });
    }
};

// Delete category (soft delete)
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            return res.json({ success: false, message: 'Category not found' });
        }

        if (!category.isActive) {
            return res.json({ success: false, message: 'Category is already deleted' });
        }

        // Check if category is being used by active drills
        const drillsUsingCategory = await AdminDrill.find({
            category: category.name,
            isActive: true
        });

        if (drillsUsingCategory.length > 0) {
            return res.json({
                success: false,
                message: `Cannot delete category. It is being used by ${drillsUsingCategory.length} active drill(s).`
            });
        }

        // Soft delete
        category.isActive = false;
        await category.save();

        // Emit real-time update
        if (req.io) {
            req.io.to('categories').emit('categoryDeleted', id);
        }

        res.json({
            success: true,
            message: `Category "${category.name}" deleted successfully`
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.json({ success: false, message: error.message });
    }
};

// Upload drill media to Cloudinary
export const uploadDrillMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ success: false, message: 'No file uploaded' });
        }

        const file = req.file;

        // Validate file type
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return res.json({
                success: false,
                message: 'Invalid file type. Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, OGG, AVI, MOV) are allowed.'
            });
        }

        // Validate file size (100MB limit for videos, 10MB for images)
        const isVideo = file.mimetype.startsWith('video/');
        const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for videos, 10MB for images

        if (file.size > maxSize) {
            return res.json({
                success: false,
                message: `File too large. Maximum size is ${isVideo ? '100MB' : '10MB'}.`
            });
        }

        // Determine resource type and folder for Cloudinary
        let resourceType = 'auto';
        let folder = 'fitness_tracker/drills';

        if (file.mimetype.startsWith('image/')) {
            resourceType = 'image';
            folder = 'fitness_tracker/drills/images';
        } else if (file.mimetype.startsWith('video/')) {
            resourceType = 'video';
            folder = 'fitness_tracker/drills/videos';
        }

        // Upload to Cloudinary with optimized settings
        const result = await new Promise((resolve, reject) => {
            const uploadOptions = {
                resource_type: resourceType,
                folder: folder,
                public_id: `drill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timeout: 60000, // 60 seconds timeout
            };

            // Different transformations for images vs videos
            if (resourceType === 'image') {
                uploadOptions.transformation = [
                    { quality: 'auto', fetch_format: 'auto' },
                    { width: 1920, height: 1080, crop: 'limit' } // Max dimensions for images
                ];
            } else if (resourceType === 'video') {
                uploadOptions.transformation = [
                    { quality: 'auto', fetch_format: 'auto' },
                    { width: 1920, height: 1080, crop: 'limit' }, // Max dimensions for videos
                    { video_codec: 'auto' }
                ];
                uploadOptions.eager = [
                    { width: 640, height: 360, crop: 'fill', quality: 'auto' } // Generate thumbnail
                ];
            }

            const stream = cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(new Error(`Upload failed: ${error.message}`));
                    } else {
                        resolve(result);
                    }
                }
            );

            // Convert buffer to stream
            const bufferStream = require('stream').Readable.from(file.buffer);
            bufferStream.pipe(stream);
        });

        // Determine media type for database
        const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';

        // For videos, also provide thumbnail URL if available
        const responseData = {
            success: true,
            videoUrl: result.secure_url,
            mediaType: mediaType,
            mediaPublicId: result.public_id,
            message: 'Media uploaded successfully'
        };

        // Add thumbnail for videos
        if (mediaType === 'video' && result.eager && result.eager.length > 0) {
            responseData.thumbnailUrl = result.eager[0].secure_url;
        }

        res.json(responseData);

    } catch (error) {
        console.error('Error uploading media:', error);

        // Provide more specific error messages
        let errorMessage = 'Failed to upload media';
        if (error.message.includes('timeout')) {
            errorMessage = 'Upload timed out. Please try with a smaller file.';
        } else if (error.message.includes('format')) {
            errorMessage = 'Unsupported file format. Please try a different file.';
        } else if (error.message.includes('size')) {
            errorMessage = 'File size exceeds limits. Please compress the file.';
        }

        res.json({
            success: false,
            message: errorMessage,
            details: error.message
        });
    }
};