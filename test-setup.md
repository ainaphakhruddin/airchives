# 🧪 Test Setup for Airchives (Node.js 12 Compatible)

## Quick Test without Full Setup

Since you're having Node.js version conflicts, here's how to test the core functionality:

### 1. Test Simple API Server
```bash
# Start the basic test server
node simple-server.js

# Test endpoints in another terminal
curl http://localhost:3001/health
curl http://localhost:3001/api/garments
curl -X POST http://localhost:3001/api/generate -H "Content-Type: application/json" -d '{"garmentId":"test","targetModelId":"sienna_01","background":"white","poses":3}'
```

### 2. Test Frontend (Basic)
```bash
# Start Next.js (may have warnings but should work)
cd apps/web && npm run dev

# Open http://localhost:3000 in browser
```

### 3. Manual Database Setup (Optional)
If you want to test with real database:

#### Install PostgreSQL
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Create database
createdb airchives

# Test connection
psql -d airchives
```

#### Set Database URL
```bash
# Add to .env.local
echo 'DATABASE_URL="postgresql://localhost:5432/airchives"' >> .env.local
```

### 4. Get API Keys for Testing

#### Fal.ai (Free)
1. Go to https://fal.ai/dashboard
2. Sign up for free account
3. Get API key from dashboard
4. Add to .env.local: `FAL_API_KEY="your_key_here"`

#### Cloudinary (Free)
1. Go to https://cloudinary.com/users/register/free
2. Sign up for free account
3. Get credentials from dashboard
4. Add to .env.local:
```
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key" 
CLOUDINARY_API_SECRET="your_api_secret"
```

### 5. Test with Mock Data

The simple server includes mock data so you can test:
- ✅ API health check
- ✅ Garment listing
- ✅ Generation requests
- ✅ Mock responses

### 6. Current Issues

**Node.js Version**: You have v12.18.0, but project requires v18+
**Prisma Version**: Latest Prisma requires Node.js 16.13+
**Workspace**: npm workspaces causing issues with your npm version

### 7. Solutions

#### Option A: Upgrade Node.js (Recommended)
```bash
# Upgrade to latest Node.js
brew install node
node --version  # Should show v20+

# Then run full setup
npm install
npm run setup
```

#### Option B: Use Test Server (Quick)
```bash
# Test core functionality immediately
node simple-server.js

# This works with your current Node.js version
```

#### Option C: Fix Workspace Issues
```bash
# Upgrade npm first
npm install -g npm@latest
npm install

# Then try setup again
npm run setup
```

### 8. Test Commands

Once running, test these endpoints:

```bash
# Health check
curl http://localhost:3001/health

# List garments (mock data)
curl http://localhost:3001/api/garments

# Start generation (mock)
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "garmentId": "test-garment-1",
    "targetModelId": "sienna_01", 
    "background": "white",
    "poses": 3
  }'
```

### 9. Expected Responses

- Health check should return: `{"status":"ok","timestamp":"..."}`
- Garment list should return mock garment data
- Generation should return: `{"success":true,"data":{"generationId":"test-gen-...","status":"pending"}}`

---

**🎯 Recommendation**: Start with `node simple-server.js` to test immediately, then upgrade Node.js for full functionality.
