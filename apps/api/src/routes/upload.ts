import { Router } from 'express';
import { uploadSingle } from '../middleware/upload';
import { CloudinaryService } from '../services/cloudinary';

const router = Router();

/**
 * POST /api/upload/garment
 * Upload a garment image for processing
 */
router.post('/garment', uploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await CloudinaryService.uploadGarment(
      req.file.buffer,
      req.file.originalname
    );

    res.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        format: result.format,
        size: result.bytes,
        dimensions: {
          width: result.width,
          height: result.height,
        },
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload image',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/upload/:publicId
 * Delete an uploaded image
 */
router.delete('/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({ error: 'Public ID is required' });
    }

    await CloudinaryService.deleteImage(publicId);
    
    res.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      error: 'Failed to delete image',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
