import { Router } from 'express';
import { AIGenerationService, GenerationRequest } from '../services/ai-generation';
import { CloudinaryService } from '../services/cloudinary';
import { prisma } from '../services/database';
import axios from 'axios';

const router = Router();

/**
 * POST /api/generate
 * Generate AI model images for a garment
 */
router.post('/', async (req, res) => {
  try {
    const { garmentId, targetModelId, background, poses, prompt, negativePrompt }: GenerationRequest = req.body;

    // Validate request
    if (!garmentId || !targetModelId) {
      return res.status(400).json({ 
        error: 'Missing required fields: garmentId, targetModelId' 
      });
    }

    // Get garment from database
    const garment = await prisma.garment.findUnique({
      where: { id: garmentId },
    });

    if (!garment) {
      return res.status(404).json({ error: 'Garment not found' });
    }

    if (!garment.originalImageUrl || !garment.maskImageUrl) {
      return res.status(400).json({ 
        error: 'Garment must be processed (segmented) before generation' 
      });
    }

    // Create AI generation record
    const generation = await prisma.aIGeneration.create({
      data: {
        garmentId,
        targetModelId,
        status: 'PENDING',
        promptUsed: prompt || 'Auto-generated prompt',
        negativePrompt,
        batchSize: poses || 3,
      },
    });

    // Start generation in background
    generateImagesInBackground(generation.id, garment.originalImageUrl, garment.maskImageUrl, {
      garmentId,
      targetModelId,
      background: background || 'white',
      poses: poses || 3,
      prompt,
      negativePrompt,
    });

    res.json({
      success: true,
      data: {
        generationId: generation.id,
        status: 'pending',
        estimatedTime: 30, // 30 seconds estimate
      },
    });
  } catch (error) {
    console.error('Generation request error:', error);
    res.status(500).json({ 
      error: 'Failed to start generation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/generate/:id
 * Get generation status and results
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const generation = await prisma.aIGeneration.findUnique({
      where: { id },
      include: {
        garment: true,
        outputImages: true,
      },
    });

    if (!generation) {
      return res.status(404).json({ error: 'Generation not found' });
    }

    res.json({
      success: true,
      data: {
        id: generation.id,
        status: generation.status.toLowerCase(),
        progress: getProgressPercentage(generation.status),
        images: generation.outputImages.map(img => ({
          id: img.id,
          url: img.imageUrl,
          aspectRatio: img.aspectRatio,
          isFavorite: img.isFavorite,
          downloadCount: img.downloadCount,
        })),
        garment: {
          id: generation.garment.id,
          originalImageUrl: generation.garment.originalImageUrl,
          category: generation.garment.category,
        },
        prompt: generation.promptUsed,
        negativePrompt: generation.negativePrompt,
        createdAt: generation.createdAt,
        completedAt: generation.completedAt,
        errorMessage: generation.errorMessage,
      },
    });
  } catch (error) {
    console.error('Get generation error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch generation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/generate
 * List all generations for a user
 */
router.get('/', async (req, res) => {
  try {
    const userId = 'temp-user-id'; // TODO: Get from authenticated user
    
    const generations = await prisma.aIGeneration.findMany({
      where: {
        garment: {
          ownerId: userId,
        },
      },
      include: {
        garment: true,
        outputImages: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: generations.map(gen => ({
        id: gen.id,
        status: gen.status.toLowerCase(),
        progress: getProgressPercentage(gen.status),
        imageCount: gen.outputImages.length,
        garment: {
          id: gen.garment.id,
          category: gen.garment.category,
        },
        createdAt: gen.createdAt,
        completedAt: gen.completedAt,
      })),
    });
  } catch (error) {
    console.error('List generations error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch generations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Background function to handle image generation
 */
async function generateImagesInBackground(
  generationId: string,
  garmentImageUrl: string,
  maskImageUrl: string,
  request: GenerationRequest
) {
  try {
    // Update status to processing
    await prisma.aIGeneration.update({
      where: { id: generationId },
      data: { status: 'PROCESSING' },
    });

    // Generate images
    const result = await AIGenerationService.generateModelImages(
      garmentImageUrl,
      maskImageUrl,
      request
    );

    // Upload generated images to Cloudinary and save to database
    const outputImages = await Promise.all(
      result.images.map(async (image, index) => {
        // Download image from AI service
        const response = await axios.get(image.url, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data);

        // Upload to Cloudinary
        const uploadResult = await CloudinaryService.uploadGeneratedImage(
          imageBuffer,
          generationId,
          index
        );

        // Save to database
        return prisma.outputImage.create({
          data: {
            generationId,
            imageUrl: uploadResult.url,
            aspectRatio: 'SQUARE', // Default to square
            isFavorite: false,
            downloadCount: 0,
          },
        });
      })
    );

    // Update generation as completed
    await prisma.aIGeneration.update({
      where: { id: generationId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    console.log(`✅ Generation ${generationId} completed with ${outputImages.length} images`);
  } catch (error) {
    console.error(`❌ Generation ${generationId} failed:`, error);
    
    // Update generation as failed
    await prisma.aIGeneration.update({
      where: { id: generationId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}

/**
 * Get progress percentage based on status
 */
function getProgressPercentage(status: string): number {
  switch (status) {
    case 'PENDING': return 0;
    case 'PROCESSING': return 50;
    case 'COMPLETED': return 100;
    case 'FAILED': return 0;
    default: return 0;
  }
}

export default router;
