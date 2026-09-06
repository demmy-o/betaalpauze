#!/bin/bash
# Handmatige deploy-script voor betaalpauze.nl op mijn.host.
#
# Gebruik: log in op de DirectAdmin Terminal (Menu -> Terminal) en draai:
#   bash deploy.sh
#
# Dit haalt de laatste commit van GitHub op, installeert dependencies,
# bouwt de Next.js productie-build en herstart de app.

set -e

cd ~/domains/betaalpauze.nl/app

echo "==> Node.js omgeving activeren..."
source ~/nodevenv/domains/betaalpauze.nl/app/20/bin/activate

echo "==> Laatste code ophalen..."
git pull origin main

echo "==> Dependencies installeren..."
npm install --include=dev

echo "==> Productie-build maken..."
npm run build

echo "==> App herstarten..."
mkdir -p tmp
touch tmp/restart.txt

echo "==> Klaar! Live commit: $(git rev-parse --short HEAD)"
