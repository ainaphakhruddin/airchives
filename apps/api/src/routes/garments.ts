import { Router } from 'express';
import { uploadSingle } from '../middleware/upload';
import { CloudinaryService } from '../services/cloudinary';
import { SegmentationService } from '../services/segmentation';
import { prisma } from '../services/database';

const router = Router();

/**
 * POST /api/garments
 * Upload and process a new garment
 */
router.post('/', uploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload original image to Cloudinary
    const uploadResult = await CloudinaryService.uploadGarment(
      req.file.buffer,
      req.file.originalname
    );

    // Process garment with AI
    const { detection, segmentation } = await SegmentationService.processGarmentImage(
      uploadResult.url
    );

    // Save to database
    const garment = await prisma.garment.create({
      data: {
        ownerId: 'temp-user-id', // TODO: Get from authenticated user
        originalImageUrl: uploadResult.url,
        category: detection.category.toUpperCase(),
        detectedColor: 'auto-detected', // TODO: Implement color detection
        maskImageUrl: segmentation.maskUrl,
        status: segmentation.garmentDetected ? 'SEGMENTED' : 'FAILED',
      },
    });

    res.json({
      success: true,
      data: {
        id: garment.id,
        url: uploadResult.url,
        maskUrl: segmentation.maskUrl,
        category: detection.category,
        confidence: detection.confidence,
        status: garment.status,
      },
    });
  } catch (error) {
    console.error('Garment processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process garment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/garments/:id
 * Get garment details and processing status
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const garment = await prisma.garment.findUnique({
      where: { id },
      include: {
        aiGenerations: {
          include: {
            outputImages: true,
          },
        },
      },
    });

    if (!garment) {
      return res.status(404).json({ error: 'Garment not found' });
    }

    res.json({
      success: true,
      data: garment,
    });
  } catch (error) {
    console.error('Get garment error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch garment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/garments
 * List all garments for a user
 */
router.get('/', async (req, res) => {
  try {
    const userId = 'temp-user-id'; // TODO: Get from authenticated user
    
    const garments = await prisma.garment.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        aiGenerations: {
          include: {
            outputImages: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: garments,
    });
  } catch (error) {
    console.error('List garments error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch garments',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/garments/:id
 * Delete a garment and all associated data
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const garment = await prisma.garment.findUnique({
      where: { id },
    });

    if (!garment) {
      return res.status(404).json({ error: 'Garment not found' });
    }

    // Delete images from Cloudinary
    if (garment.originalImageUrl) {
      const publicId = garment.originalImageUrl.split('/').pop()?.split('.')[0];
      if (publicId) {
        await CloudinaryService.deleteImage(`airchives/garments/${publicId}`);
      }
    }

    if (garment.maskImageUrl) {
      const publicId = garment.maskImageUrl.split('/').pop()?.split('.')[0];
      if (publicId) {
        await CloudinaryService.deleteImage(`airchives/garments/${publicId}`);
      }
    }

    // Delete from database (cascade will handle related records)
    await prisma.garment.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Garment deleted successfully',
    });
  } catch (error) {
    console.error('Delete garment error:', error);
    res.status(500).json({ 
      error: 'Failed to delete garment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
