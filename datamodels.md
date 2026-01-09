For a high-quality AI reselling tool, your data model needs to handle not just basic user data, but also the complexity of **AI generation states**, **image segmentation metadata**, and **marketplace-specific requirements**.

Here is the recommended data schema using a TypeScript/Node.js-friendly structure (ideal for an ORM like **Prisma** or **TypeORM**).

---

## 1. Core Entity Relationship Diagram (ERD)

The system revolves around the `Garment`, which undergoes an `AIGeneration` process to produce multiple `OutputImages`.

---

## 2. Detailed Data Models (TypeScript/Prisma Style)

### A. User & Profile

Tracks the seller and their preferences (e.g., preferred model types for their brand).

```typescript
interface User {
  id: string; // UUID
  email: string;
  passwordHash: string;
  subscriptionPlan: 'free' | 'pro' | 'enterprise';
  preferredModelId?: string; // Links to a default Model profile
  createdAt: Date;
}

```

### B. Garment (The Input)

Stores the original "flat lay" or "hanger" photo uploaded by the user and its AI-parsed metadata.

```typescript
interface Garment {
  id: string;
  ownerId: string; // Foreign Key to User
  originalImageUrl: string; // S3/Cloudinary URL
  category: 'top' | 'bottom' | 'dress' | 'outerwear';
  detectedColor: string;
  maskImageUrl?: string; // The "cut-out" version of the garment (Segmentation)
  status: 'uploaded' | 'segmented' | 'failed';
  createdAt: Date;
}

```

### C. AI Generation Request

This is the "Job" table. Since AI generation takes 15–30 seconds, you need to track the state of the task.

```typescript
interface AIGeneration {
  id: string;
  garmentId: string;
  targetModelId: string; // The AI model person chosen
  status: 'pending' | 'processing' | 'completed' | 'failed';
  promptUsed: string; // The exact prompt sent to Stable Diffusion/DALL-E
  negativePrompt?: string;
  batchSize: number; // e.g., 3 images
  errorMessage?: string;
  completedAt?: Date;
}

```

### D. Output Image (The Result)

The final professional photos the user will download and upload to eBay/Poshmark.

```typescript
interface OutputImage {
  id: string;
  generationId: string;
  imageUrl: string;
  aspectRatio: '1:1' | '4:5' | '3:4';
  isFavorite: boolean; // Seller can star the best ones
  downloadCount: number;
}

```

---

## 3. Supporting Metadata Models

To make the tool "professional," you should include a table for **Virtual Models**.

| Model ID | Name | Gender | Body Type | Ethnicity | Style Tags |
| --- | --- | --- | --- | --- | --- |
| `mod_01` | "Sienna" | Female | Athletic | Mediterranean | Streetwear, Urban |
| `mod_02` | "Alex" | Non-binary | Slim | East Asian | Minimalist, Luxury |
| `ghost_01` | "Ghost" | N/A | Standard | N/A | Invisible Mannequin |

---

## 4. Why this model works for Web/Node.js

1. **Asynchronous Handling:** By separating `AIGeneration` into its own table, your Node.js backend can use **WebSockets** or **Polling** to update the UI once the AI finishes.
2. **Segmentation Caching:** Storing the `maskImageUrl` in the `Garment` table prevents you from having to re-run the "clothing cutout" AI if the user wants to try the same shirt on a different model later.
3. **Marketplace Readiness:** The `OutputImage` table allows you to store different crops (Square for eBay, Portrait for Depop) for the same generation.

