#!/bin/bash

echo "🚀 Setting up ERP Beta project..."

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
pnpm --filter @repo/db db:generate

# Run migrations (if DATABASE_URL is set)
if [ ! -z "$DATABASE_URL" ]; then
    echo "🗄️ Running database migrations..."
    pnpm --filter @repo/db db:deploy
    
    echo "🌱 Seeding database..."
    pnpm --filter @repo/db db:seed
else
    echo "⚠️ DATABASE_URL not set, skipping migrations and seeding"
fi

echo "✅ Setup complete! You can now run:"
echo "  pnpm dev - Start development servers"
echo "  pnpm build - Build for production"