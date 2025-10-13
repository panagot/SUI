# Deployment Guide

This guide will help you deploy the Sui Transaction Explainer to production.

## Prerequisites

- Node.js 18+ installed
- Git repository with your code
- Account on deployment platform (Vercel, Netlify, etc.)

## Option 1: Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy Next.js apps.

### Steps:

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up or log in
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Build Settings**
   - Framework Preset: **Next.js** (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install --legacy-peer-deps`

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for the build
   - Your app will be live at `https://your-app.vercel.app`

### Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Option 2: Deploy to Netlify

### Steps:

1. **Build the project locally**
   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod
   ```

3. **Or deploy via Netlify UI**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your `.next` folder
   - Or connect your Git repository

### Build Settings for Netlify:
- Build command: `npm run build`
- Publish directory: `.next`
- Node version: `18`

## Option 3: Deploy to Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Configure**
   - Build command: `npm run build`
   - Start command: `npm start`

## Option 4: Self-Host (VPS/Cloud)

### Requirements:
- Ubuntu 20.04+ or similar
- Node.js 18+
- PM2 for process management
- Nginx for reverse proxy

### Steps:

1. **Clone and install**
   ```bash
   git clone <your-repo>
   cd sui-transaction-explainer
   npm install --legacy-peer-deps
   npm run build
   ```

2. **Install PM2**
   ```bash
   npm install -g pm2
   pm2 start npm --name "sui-explainer" -- start
   pm2 startup
   pm2 save
   ```

3. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Enable HTTPS with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Environment Configuration

No environment variables are required! The app uses Sui's public RPC endpoints.

If you want to use a custom RPC endpoint:

1. Create `.env.local`:
   ```env
   NEXT_PUBLIC_SUI_NETWORK=mainnet
   NEXT_PUBLIC_SUI_RPC_URL=https://your-custom-rpc-url
   ```

2. Update `lib/suiClient.ts`:
   ```typescript
   const rpcUrl = process.env.NEXT_PUBLIC_SUI_RPC_URL || getFullnodeUrl('mainnet');
   const client = new SuiClient({ url: rpcUrl });
   ```

## Performance Optimization

### Enable Caching

Add these headers in `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=60, s-maxage=60' },
        ],
      },
    ];
  },
};
```

### Use CDN

- Vercel and Netlify include CDN automatically
- For self-hosting, consider Cloudflare

### Enable Compression

Add to `next.config.js`:
```javascript
module.exports = {
  compress: true,
};
```

## Monitoring

### Vercel Analytics

1. Install: `npm install @vercel/analytics`
2. Add to `app/layout.tsx`:
   ```typescript
   import { Analytics } from '@vercel/analytics/react';
   
   export default function Layout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

### Error Tracking (Sentry)

1. Install: `npm install @sentry/nextjs`
2. Run: `npx @sentry/wizard@latest -i nextjs`
3. Follow the prompts

## Troubleshooting

### Build Fails

- **Issue**: Dependency conflicts
- **Solution**: Use `npm install --legacy-peer-deps`

### App Loads Slowly

- **Issue**: Cold starts on serverless platforms
- **Solution**: Keep app warm with uptime monitoring (e.g., UptimeRobot)

### RPC Rate Limiting

- **Issue**: Too many requests to public RPC
- **Solution**: 
  - Add caching layer
  - Use your own Sui fullnode
  - Implement request throttling

## Cost Estimates

### Free Tier Options:
- **Vercel**: Free for personal projects (100GB bandwidth/month)
- **Netlify**: Free tier (100GB bandwidth/month)
- **Railway**: $5/month credit (suitable for low traffic)

### Paid Options:
- **Vercel Pro**: $20/month (1TB bandwidth)
- **Netlify Pro**: $19/month (400GB bandwidth)
- **VPS (DigitalOcean)**: $6/month (basic droplet)

## Security

### HTTPS
- Always use HTTPS in production
- Free with Vercel/Netlify
- Use Let's Encrypt for self-hosting

### Rate Limiting
Consider adding rate limiting for API calls:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimits = new Map();

export function middleware(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const max = 30; // 30 requests per minute

  const record = rateLimits.get(ip);
  if (record && now - record.timestamp < windowMs) {
    if (record.count >= max) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
    record.count++;
  } else {
    rateLimits.set(ip, { timestamp: now, count: 1 });
  }

  return NextResponse.next();
}
```

## Support

For deployment issues:
- Check [Next.js deployment docs](https://nextjs.org/docs/deployment)
- Review platform-specific guides
- Check application logs

## Maintenance

### Regular Updates
```bash
npm update
npm audit fix
git commit -am "Update dependencies"
git push
```

### Monitoring Uptime
- Use [UptimeRobot](https://uptimerobot.com) (free)
- Or [Better Uptime](https://betteruptime.com)

### Backup
- Git repo is your backup
- No database to back up
- No user data stored

---

**Congratulations!** Your Sui Transaction Explainer is now deployed and accessible to the world! 🚀

