# Deployment: mijn.host

Betaalpauze.nl draait als een Node.js app via DirectAdmin op mijn.host.

---

## Eerste keer instellen

### 1. Node.js app aanmaken in DirectAdmin

1. Log in op DirectAdmin via mijn.host controlepaneel
2. Ga naar **Extra Kenmerken → Setup Node.js App**
3. Klik op **Create Application** met deze instellingen:
   - **Node.js version**: 20 (of nieuwste recommended)
   - **Application mode**: Development (later omzetten naar Production)
   - **Application root**: `domains/betaalpauze.nl/app`
   - **Application URL**: leeg laten (voor root domein)
   - **Application startup file**: `server.js`
4. Kopieer de `source` activatieregel bovenaan de app — die heb je nodig via SSH

### 2. Verbinden via SSH

Zie de mijn.host kennisbank: https://mijn.host/kb/webhosting/verbinden-met-ssh

```bash
ssh gebruikersnaam@betaalpauze.nl
```

### 3. Virtual environment activeren

Plak de activatieregel die je uit DirectAdmin hebt gekopieerd, bijvoorbeeld:

```bash
source /home/gebruikersnaam/nodevenv/domains/betaalpauze.nl/app/20/bin/activate
cd /home/gebruikersnaam/domains/betaalpauze.nl/app
```

### 4. Repository clonen

```bash
git clone https://github.com/demmy-o/betaalpauze.git .
```

### 5. Dependencies installeren en bouwen

```bash
npm install
npm run build
```

### 6. Omgevingsvariabelen instellen

Maak `.env.production` aan op de server (of stel ze in via DirectAdmin):

```bash
nano .env.production
```

Vul de productiewaarden in (zelfde keys als `.env.local`).

### 7. Application mode omzetten naar Production

Ga terug naar DirectAdmin → Setup Node.js App en zet **Application mode** op **Production**.

---

## Elke keer deployen (na een update)

```bash
# SSH inloggen
ssh gebruikersnaam@betaalpauze.nl

# Virtual environment activeren
source /home/gebruikersnaam/nodevenv/domains/betaalpauze.nl/app/20/bin/activate
cd /home/gebruikersnaam/domains/betaalpauze.nl/app

# Laatste code ophalen
git pull

# Dependencies bijwerken (alleen als package.json veranderd is)
npm install

# Opnieuw bouwen
npm run build

# App herstarten via DirectAdmin
# Ga naar Setup Node.js App → klik Restart
```

---

## SSL certificaat

Vraag een gratis Let's Encrypt certificaat aan via:
DirectAdmin → SSL Certificates → Let's Encrypt

Zie ook: https://mijn.host/kb/webhosting/lets-encrypt-ssl-certificaat-aanvragen

---

## Handige links

- DirectAdmin login: https://mijn.host/kb/webhosting/hoe-log-ik-in-op-directadmin
- SSH verbinden: https://mijn.host/kb/webhosting/verbinden-met-ssh
- Node.js app: https://mijn.host/kb/web-apps/node-js-applicatie-draaien-op-je-hostingpakket
- SFTP via FileZilla: https://mijn.host/kb/webhosting/verbinden-via-sftp-in-filezilla
