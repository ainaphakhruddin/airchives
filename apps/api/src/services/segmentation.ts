import axios from 'axios';

// Fal.ai configuration
const FAL_API_URL = 'https://api.fal.ai';

// Helper function to get API key
const getFalApiKey = () => {
  const apiKey = process.env.FAL_API_KEY;
  if (!apiKey) {
    console.warn('FAL_API_KEY not found in environment variables');
    throw new Error('FAL_API_KEY is required for garment segmentation');
  }
  return apiKey;
};

export interface SegmentationResult {
  maskUrl: string;
  confidence: number;
  garmentDetected: boolean;
}

export interface GarmentDetection {
  category: 'top' | 'bottom' | 'dress' | 'outerwear';
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export class SegmentationService {
  /**
   * Segment garment from background using Segment Anything Model
   */
  static async segmentGarment(imageUrl: string): Promise<SegmentationResult> {
    try {
      const response = await axios.post(
        `${FAL_API_URL}/v1/models/fal-ai/image-segmentation`,
        {
          image_url: imageUrl,
          model_type: 'sam2',
          confidence_threshold: 0.7,
        },
        {
          headers: {
            'Authorization': `Key ${getFalApiKey()}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      const result = response.data;
      
      return {
        maskUrl: result.mask_url || result.output?.mask_url,
        confidence: result.confidence || 0.8,
        garmentDetected: result.detected || true,
      };
    } catch (error) {
      console.error('Segmentation error:', error);
      throw new Error(`Failed to segment garment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Detect garment type and category
   */
  static async detectGarmentType(imageUrl: string): Promise<GarmentDetection> {
    try {
      const response = await axios.post(
        `${FAL_API_URL}/v1/models/fal-ai/image-classification`,
        {
          image_url: imageUrl,
          model_name: 'vit-base-patch16-224',
          categories: ['clothing', 'fashion', 'apparel'],
        },
        {
          headers: {
            'Authorization': `Key ${getFalApiKey()}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const classification = response.data;
      const detectedCategory = this.mapToGarmentCategory(classification.label);
      
      return {
        category: detectedCategory,
        confidence: classification.confidence || 0.8,
        boundingBox: classification.bounding_box || {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
        },
      };
    } catch (error) {
      console.error('Garment detection error:', error);
      // Fallback to default category
      return {
        category: 'top',
        confidence: 0.5,
        boundingBox: {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
        },
      };
    }
  }

  /**
   * Process image: detect type and segment garment
   */
  static async processGarmentImage(imageUrl: string): Promise<{
    detection: GarmentDetection;
    segmentation: SegmentationResult;
  }> {
    const [detection, segmentation] = await Promise.all([
      this.detectGarmentType(imageUrl),
      this.segmentGarment(imageUrl),
    ]);

    return { detection, segmentation };
  }

  /**
   * Map classification label to garment category
   */
  private static mapToGarmentCategory(label: string): 'top' | 'bottom' | 'dress' | 'outerwear' {
    const lowerLabel = label.toLowerCase();
    
    if (lowerLabel.includes('dress') || lowerLabel.includes('gown')) {
      return 'dress';
    }
    if (lowerLabel.includes('jacket') || lowerLabel.includes('coat') || lowerLabel.includes('blazer')) {
      return 'outerwear';
    }
    if (lowerLabel.includes('pants') || lowerLabel.includes('skirt') || lowerLabel.includes('shorts')) {
      return 'bottom';
    }
    
    // Default to top for shirts, t-shirts, blouses, etc.
    return 'top';
  }

  /**
   * Check if API key is configured
   */
  static isConfigured(): boolean {
    return !!process.env.FAL_API_KEY;
  }
}
