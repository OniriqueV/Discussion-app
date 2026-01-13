#!/bin/bash
# setup-uploads.sh

echo "🔧 Setting up uploads directory structure..."

mkdir -p uploads/post-images
mkdir -p uploads/temp
mkdir -p uploads/avatars

chmod -R 755 uploads/

echo "✅ Created directory structure:"
echo "uploads/"
echo "├── post-images/"
echo "├── temp/"
echo "└── avatars/"

touch uploads/post-images/.gitkeep
touch uploads/temp/.gitkeep
touch uploads/avatars/.gitkeep

echo "✅ Setup complete!"
echo "📁 Files will be accessible at: http://localhost:3001/uploads/"
