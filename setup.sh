#!/bin/bash
# setup.sh — betaalpauze.nl project setup
# Draai dit vanuit ~/Documents/PROJECTEN/WEBSITES/betaalpauze.nl
# met: bash setup.sh

set -e

echo "🚀 Betaalpauze.nl project setup"
echo "================================"

# 1. Next.js project aanmaken
echo ""
echo "📦 Next.js installeren..."

# Bestaande bestanden tijdelijk wegzetten zodat create-next-app niet zeurt
mkdir -p /tmp/betaalpauze-backup
[ -f CLAUDE.md ] && mv CLAUDE.md /tmp/betaalpauze-backup/
[ -f setup.sh ] && mv setup.sh /tmp/betaalpauze-backup/
[ -d docs ] && mv docs /tmp/betaalpauze-backup/

npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --no-turbopack

# Bestanden terugzetten
[ -f /tmp/betaalpauze-backup/CLAUDE.md ] && mv /tmp/betaalpauze-backup/CLAUDE.md .
[ -d /tmp/betaalpauze-backup/docs ] && mv /tmp/betaalpauze-backup/docs .
[ -f /tmp/betaalpauze-backup/setup.sh ] && mv /tmp/betaalpauze-backup/setup.sh .

# 2. Extra packages installeren
echo ""
echo "📦 Dependencies installeren..."
npm install motion
npm install @supabase/supabase-js
npm install resend
npm install zod

# 3. shadcn/ui initialiseren
echo ""
echo "🎨 shadcn/ui initialiseren..."
npx shadcn@latest init --defaults

# 4. Veelgebruikte shadcn componenten installeren
echo ""
echo "🎨 shadcn componenten installeren..."
npx shadcn@latest add button input label form select textarea badge card progress

# 5. Mapstructuur aanmaken
echo ""
echo "📁 Mapstructuur aanmaken..."
mkdir -p app/aanvragen
mkdir -p app/api/send-email
mkdir -p app/components/landing
mkdir -p app/components/steps
mkdir -p app/lib
mkdir -p app/context
mkdir -p docs
mkdir -p public

# 6. .env.local aanmaken
echo ""
echo "🔑 .env.local aanmaken..."
cat > .env.local << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Email (Resend)
RESEND_API_KEY=
FROM_EMAIL=noreply@betaalpauze.nl
EOF

# 7. .env.local toevoegen aan .gitignore (als het er niet al in staat)
if ! grep -q ".env.local" .gitignore 2>/dev/null; then
  echo ".env.local" >> .gitignore
fi
echo ".env*.local" >> .gitignore

# 8. Git remote instellen (als er nog geen remote is)
if ! git remote | grep -q origin; then
  echo ""
  echo "🔗 Git remote instellen..."
  git remote add origin https://github.com/demmy-o/betaalpauze.git
fi

echo ""
echo "✅ Setup klaar!"
echo ""
echo "Volgende stappen:"
echo "  1. Vul .env.local in met je API keys"
echo "  2. npm run dev → http://localhost:3000"
echo "  3. Begin met bouwen — raadpleeg CLAUDE.md voor context"
