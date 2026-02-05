# Weekly Wrapped Newsletter Frontend

Next.js frontend application for generating, viewing, and sharing weekly TikTok activity reports.

## 📚 Documentation
- **[Project Review & Architecture](./PROJECT_REVIEW.md)**: Detailed overview of the system architecture, tech stack, and optimization recommendations.
- **[Smoke Test Plan](./SMOKE_TEST.md)**: Manual verification steps for critical business flows.
- **[Tracking Implementation](./TRACKING.md)**: Comprehensive guide to the event tracking system.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Variables
Copy `.env.example` to `.env` and fill in the required Firebase and API credentials.

## 🏗 Project Structure

- `app/`: Next.js App Router pages and API routes.
- `src/domain/`: Core business logic and type definitions.
- `src/lib/`: Utility libraries (Firebase, Tracking, etc.).
- `emails/`: React Email templates.
- `public/`: Static assets.

## 🧪 Testing

Refer to [SMOKE_TEST.md](./SMOKE_TEST.md) for manual testing procedures.

## 📝 License
Private Repository.
