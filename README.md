# Airchives - AI Model Generator

Transform vintage clothing photos into professional model shots using AI.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL (for production)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd airchives
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Start development servers:
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- API: http://localhost:3001

## 📁 Project Structure

```
airchives/
├── apps/
│   ├── web/           # Next.js frontend
│   └── api/           # Node.js backend API
├── packages/
│   ├── shared/        # Shared types and utilities
│   └── ui/           # Shared UI components
├── docs/             # Documentation (PRD, DataModels, etc.)
└── turbo.json        # Turborepo configuration
```

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **AI/ML**: Stable Diffusion, Segment Anything Model
- **Infrastructure**: AWS S3/Cloudinary, Turborepo

## 📋 Development Tasks

See [backlog.md](./backlog.md) for detailed task breakdown and prioritization.

### Current Sprint Focus

1. ✅ Initialize monorepo structure
2. 🔄 Configure database schema (Prisma)
3. ⏳ Set up image storage (Cloudinary/AWS S3)
4. ⏳ Implement garment segmentation API

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/task-number-description`
2. Make your changes
3. Run tests: `npm run test`
4. Commit your changes: `git commit -m "feat: description"`
5. Push to the branch: `git push origin feature/task-number-description`
6. Open a pull request

## 📄 License

MIT License - see LICENSE file for details.
