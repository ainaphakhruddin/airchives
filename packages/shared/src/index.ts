import { z } from 'zod';

// User schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  subscriptionPlan: z.enum(['free', 'pro', 'enterprise']),
  preferredModelId: z.string().optional(),
  createdAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

// Garment schema
export const GarmentSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid(),
  originalImageUrl: z.string().url(),
  category: z.enum(['top', 'bottom', 'dress', 'outerwear']),
  detectedColor: z.string(),
  maskImageUrl: z.string().url().optional(),
  status: z.enum(['uploaded', 'segmented', 'failed']),
  createdAt: z.date(),
});

export type Garment = z.infer<typeof GarmentSchema>;

// AI Generation schema
export const AIGenerationSchema = z.object({
  id: z.string().uuid(),
  garmentId: z.string().uuid(),
  targetModelId: z.string(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  promptUsed: z.string(),
  negativePrompt: z.string().optional(),
  batchSize: z.number().min(1).max(10),
  errorMessage: z.string().optional(),
  completedAt: z.date().optional(),
});

export type AIGeneration = z.infer<typeof AIGenerationSchema>;

// Output Image schema
export const OutputImageSchema = z.object({
  id: z.string().uuid(),
  generationId: z.string().uuid(),
  imageUrl: z.string().url(),
  aspectRatio: z.enum(['1:1', '4:5', '3:4']),
  isFavorite: z.boolean().default(false),
  downloadCount: z.number().default(0),
});

export type OutputImage = z.infer<typeof OutputImageSchema>;

// API Request/Response schemas
export const GenerateRequestSchema = z.object({
  garmentId: z.string().uuid(),
  targetModelId: z.string(),
  background: z.enum(['white', 'grey', 'beige', 'streetwear', 'indoor_loft']).default('white'),
  poses: z.number().min(1).max(3).default(3),
});

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

export const GenerateResponseSchema = z.object({
  generationId: z.string().uuid(),
  status: z.enum(['pending', 'processing']),
  estimatedTime: z.number(), // seconds
});

export type GenerateResponse = z.infer<typeof GenerateResponseSchema>;
