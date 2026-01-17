# 🚀 Airchives Project Setup & Testing Guide

## Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PostgreSQL** - [Install guide](https://www.postgresql.org/download/)
- **Cloudinary Account** - [Sign up free](https://cloudinary.com/users/register/free)
- **Fal.ai API Key** - [Get API key](https://fal.ai/dashboard)

## 1. Environment Setup

### Clone and Install
```bash
git clone <repository-url>
cd airchives
npm install
```

### Environment Variables
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your credentials:
DATABASE_URL="postgresql://username:password@localhost:5432/airchives"
FAL_API_KEY="your_fal_api_key"
REPLICATE_API_TOKEN="your_replicate_token" # Optional
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
FRONTEND_URL="http://localhost:3000"
PORT=3001
```

## 2. Database Setup

### PostgreSQL Setup
```bash
# Create database
createdb airchives

# Or using psql
psql -c "CREATE DATABASE airchives;"
```

### Initialize Database
```bash
# Generate Prisma client and create tables
npm run db:setup

# Or step by step:
cd apps/api
npm run db:generate  # Generate client
npm run db:push     # Create tables
npm run db:seed     # Insert virtual models
```

## 3. Running the Project

### Development Mode
```bash
# Start both frontend and backend
npm run dev

# Or start individually:
cd apps/web && npm run dev    # Frontend on :3000
cd apps/api && npm run dev    # Backend API on :3001
```

### Production Build
```bash
npm run build
npm run start
```

## 4. Testing the API

### Health Check
```bash
curl http://localhost:3001/health
```

### Upload Test (requires image file)
```bash
# Create a test image upload
curl -X POST \
  http://localhost:3001/api/upload/garment \
  -H "Content-Type: multipart/form-data" \
  -F "image=@test-image.jpg"
```

### Test Garment Processing
```bash
# Get garment status
curl http://localhost:3001/api/garments/{garment-id}

# List all garments
curl http://localhost:3001/api/garments
```

### Test AI Generation
```bash
# Start generation
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "garmentId": "your-garment-id",
    "targetModelId": "sienna_01",
    "background": "white",
    "poses": 3
  }'

# Check generation status
curl http://localhost:3001/api/generate/{generation-id}
```

## 5. Frontend Testing

### Access the Web App
Open your browser and navigate to:
- **Frontend:** http://localhost:3000
- **API Docs:** http://localhost:3001/health

### Test Image Upload
1. Navigate to the upload page (when implemented)
2. Drag and drop a garment image
3. Check browser network tab for API calls
4. Verify image appears in Cloudinary dashboard

## 6. Database Management

### View Database
```bash
# Open Prisma Studio
cd apps/api
npm run db:studio

# Access at http://localhost:5555
```

### Reset Database
```bash
cd apps/api
npm run db:push --force-reset
npm run db:seed
```

## 7. Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill processes on ports 3000/3001
lsof -ti:3000 | xargs kill
lsof -ti:3001 | xargs kill
```

**Database connection error:**
```bash
# Check PostgreSQL is running
pg_isready

# Check connection string
psql $DATABASE_URL -c "SELECT 1;"
```

**Missing dependencies:**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

**API errors:**
```bash
# Check environment variables
cat .env.local

# Check API keys
curl -H "Authorization: Key $FAL_API_KEY" https://api.fal.ai/v1/models
```

## 8. Development Workflow

### Daily Development
```bash
# 1. Start development servers
npm run dev

# 2. Make changes to code

# 3. Test API endpoints
# Use curl, Postman, or the frontend

# 4. Check database changes
npm run db:studio

# 5. Run tests (when implemented)
npm run test
```

### Git Workflow
```bash
# Feature branch
git checkout -b feature/task-number-description

# Commit changes
git add .
git commit -m "feat: implement feature description"

# Push and PR
git push origin feature/task-number-description
```

## 9. Production Deployment

### Environment Variables for Production
```bash
# Production .env
NODE_ENV=production
DATABASE_URL="production-db-url"
FAL_API_KEY="production-api-key"
CLOUDINARY_CLOUD_NAME="production-cloud"
# ... other production secrets
```

### Build Commands
```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 10. Monitoring

### Logs
```bash
# Development logs (auto-generated)
npm run dev

# Production logs
pm2 logs airchives-api
```

### Health Monitoring
```bash
# API health
curl https://your-domain.com/api/health

# Database connectivity
curl https://your-domain.com/api/health
```

---

**🎯 Next Steps:**
1. Set up your API keys and database
2. Run `npm run setup` to initialize everything
3. Start development with `npm run dev`
4. Test the upload and generation endpoints
5. Check the frontend at http://localhost:3000
