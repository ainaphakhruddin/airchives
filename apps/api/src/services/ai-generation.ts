import axios from 'axios';

// AI Service configuration
const FAL_API_URL = 'https://api.fal.ai';
const FAL_API_KEY = process.env.FAL_API_KEY;
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

export interface GenerationRequest {
  garmentId: string;
  targetModelId: string;
  background: 'white' | 'grey' | 'beige' | 'streetwear' | 'indoor_loft';
  poses: number;
  prompt?: string;
  negativePrompt?: string;
}

export interface GenerationResult {
  id: string;
  images: Array<{
    url: string;
    publicId: string;
    pose: string;
  }>;
  prompt: string;
  processingTime: number;
}

export class AIGenerationService {
  /**
   * Generate AI model images using segmented garment
   */
  static async generateModelImages(
    garmentImageUrl: string,
    maskImageUrl: string,
    request: GenerationRequest
  ): Promise<GenerationResult> {
    try {
      // Get virtual model details
      const modelDetails = await this.getVirtualModel(request.targetModelId);
      
      // Build prompt based on model and background
      const prompt = this.buildPrompt(
        modelDetails,
        request.background,
        request.prompt
      );
      
      const negativePrompt = request.negativePrompt || this.getDefaultNegativePrompt();

      // Generate images using ControlNet
      const images = await Promise.all(
        Array.from({ length: request.poses }, (_, i) =>
          this.generateSingleImage(
            garmentImageUrl,
            maskImageUrl,
            prompt,
            negativePrompt,
            modelDetails,
            i
          )
        )
      );

      return {
        id: `gen_${Date.now()}`,
        images,
        prompt,
        processingTime: 0, // TODO: Track actual processing time
      };
    } catch (error) {
      console.error('AI generation error:', error);
      throw new Error(`Failed to generate AI images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a single image with specific pose
   */
  private static async generateSingleImage(
    garmentImageUrl: string,
    maskImageUrl: string,
    prompt: string,
    negativePrompt: string,
    modelDetails: any,
    poseIndex: number
  ): Promise<{ url: string; publicId: string; pose: string }> {
    const poses = ['front', 'side_45', 'back'];
    const pose = poses[poseIndex % poses.length];

    try {
      // Use Fal.ai for generation
      if (FAL_API_KEY) {
        const response = await axios.post(
          `${FAL_API_URL}/v1/models/fal-ai/stable-diffusion-xl`,
          {
            prompt,
            negative_prompt: negativePrompt,
            image_url: garmentImageUrl,
            mask_url: maskImageUrl,
            controlnet_condition: pose,
            num_inference_steps: 30,
            guidance_scale: 7.5,
            strength: 0.8,
            seed: Math.floor(Math.random() * 1000000),
            width: 1024,
            height: 1024,
          },
          {
            headers: {
              'Authorization': `Key ${FAL_API_KEY}`,
              'Content-Type': 'application/json',
            },
            timeout: 120000, // 2 minutes timeout
          }
        );

        return {
          url: response.data.images[0].url,
          publicId: response.data.images[0].id,
          pose,
        };
      }
      
      // Fallback to Replicate
      if (REPLICATE_API_TOKEN) {
        const response = await axios.post(
          'https://api.replicate.com/v1/predictions',
          {
            version: 'stability-ai/stable-diffusion-xl-base-1.0:462fc9e22adc8c8d30db8e838f61d4fbedbcb9f5c3f7874f5774e7d9e814001',
            input: {
              prompt,
              negative_prompt: negativePrompt,
              image: garmentImageUrl,
              mask: maskImageUrl,
              num_inference_steps: 30,
              guidance_scale: 7.5,
              strength: 0.8,
              seed: Math.floor(Math.random() * 1000000),
              width: 1024,
              height: 1024,
            },
          },
          {
            headers: {
              'Authorization': `Token ${REPLICATE_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
            timeout: 120000,
          }
        );

        // Poll for completion
        let prediction = response.data;
        while (prediction.status === 'starting' || prediction.status === 'processing') {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const pollResponse = await axios.get(
            `https://api.replicate.com/v1/predictions/${prediction.id}`,
            {
              headers: {
                'Authorization': `Token ${REPLICATE_API_TOKEN}`,
              },
            }
          );
          prediction = pollResponse.data;
        }

        if (prediction.status === 'succeeded') {
          return {
            url: prediction.output[0],
            publicId: prediction.id,
            pose,
          };
        }
      }

      throw new Error('No AI service available');
    } catch (error) {
      console.error('Single image generation error:', error);
      throw error;
    }
  }

  /**
   * Get virtual model details from database
   */
  private static async getVirtualModel(modelId: string): Promise<any> {
    // TODO: Implement database lookup
    // For now, return mock data
    const mockModels = {
      'sienna_01': {
        name: 'Sienna',
        gender: 'female',
        bodyType: 'athletic',
        ethnicity: 'mediterranean',
        styleTags: ['streetwear', 'urban'],
      },
      'alex_01': {
        name: 'Alex',
        gender: 'non_binary',
        bodyType: 'slim',
        ethnicity: 'east_asian',
        styleTags: ['minimalist', 'luxury'],
      },
      'ghost_01': {
        name: 'Ghost',
        gender: 'non_binary',
        bodyType: 'standard',
        ethnicity: 'n/a',
        styleTags: ['invisible', 'mannequin'],
      },
    };

    return mockModels[modelId as keyof typeof mockModels] || mockModels.sienna_01;
  }

  /**
   * Build detailed prompt for image generation
   */
  private static buildPrompt(
    model: any,
    background: string,
    customPrompt?: string
  ): string {
    const backgroundPrompts = {
      white: 'clean white studio background, professional lighting',
      grey: 'neutral grey studio background, soft lighting',
      beige: 'warm beige studio background, natural lighting',
      streetwear: 'urban street background, city setting, natural lighting',
      indoor_loft: 'modern loft interior, warm lighting, lifestyle setting',
    };

    const basePrompt = customPrompt || `professional fashion photography of ${model.name} wearing ${model.styleTags.join(', ')} clothing, ${model.bodyType} build, ${model.ethnicity} features, high fashion, editorial style`;

    return `${basePrompt}, ${backgroundPrompts[background as keyof typeof backgroundPrompts]}, ultra realistic, 8k, detailed textures, professional photography, fashion magazine quality`;
  }

  /**
   * Get default negative prompt
   */
  private static getDefaultNegativePrompt(): string {
    return 'blurry, low quality, distorted, deformed, disfigured, bad anatomy, extra limbs, missing limbs, floating limbs, disconnected limbs, mutation, mutated, ugly, disgusting, amputation, low resolution, jpeg artifacts, compression artifacts, noise, grain, film grain, blurry, out of focus, poorly drawn, bad art, beginner, amateur, distorted face';
  }

  /**
   * Check if AI services are configured
   */
  static isConfigured(): boolean {
    return !!(FAL_API_KEY || REPLICATE_API_TOKEN);
  }
}
