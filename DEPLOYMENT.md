# Deployment Guide

This guide walks you through deploying the Trading Dashboard to production on Vercel.

## Prerequisites

- GitHub account (for connecting to Vercel)
- Vercel account (free tier available)
- Supabase project with database schema created
- All environment variables configured

## Step 1: Prepare Your Repository

### Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Create a new public or private repository
3. Name it `trading-dashboard` (or your preferred name)
4. Click "Create repository"

### Push Your Code

```bash
cd c:\Users\Admin\Documents\trading-dashboard

# Add remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/trading-dashboard.git
git branch -M main
git push -u origin main

# Or if you already have origin:
git push origin main
```

## Step 2: Set Up Supabase Database

This is **critical** - the app won't work without the database!

1. Go to [supabase.com](https://supabase.com) and sign in
2. Open your project dashboard
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy the entire content from [DATABASE.sql](./DATABASE.sql)
6. Paste into the SQL editor
7. Click "RUN" (top right)  
8. Wait for all queries to complete (should see success message)
9. Verify all 6 tables are created:
   - user_profiles
   - trading_accounts
   - trades
   - trade_checklist_items
   - trade_journal_entries
   - transactions

### Verify RLS Policies

Ensure Row Level Security is enabled:

1. Navigate to Authentication > Policies
2. You should see policies for each table
3. All policies should be enabled (green toggle)

## Step 3: Deploy to Vercel

### Option A: Quick Deploy (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Continue with GitHub"
3. Authorize Vercel to access your repositories
4. Search and select `trading-dashboard`
5. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: ./ (default)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: .next (auto-filled)

6. Click "Environment Variables"
7. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://grrxcrmgmjqmstdaiyvs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdycnhjcm1nbWpxbXN0ZGFpeXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5ODU4NDAsImV4cCI6MjA4ODU2MTg0MH0.5WyaONThivQ6BteOl-0tEpqHzqvCx7W80AD7Soa67Jg
NEXT_PUBLIC_APP_NAME = Trading Dashboard
```

8. Click "Deploy"
9. Wait for deployment to complete (2-5 minutes)
10. You'll get a production URL like: `https://trading-dashboard-xxx.vercel.app`

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd c:\Users\Admin\Documents\trading-dashboard
vercel --prod

# Follow prompts, link to GitHub repo, add env variables
```

## Step 4: Configure Production Environment

### Update Supabase Settings

1. Go to Supabase project settings
2. Navigate to Authentication > URL Configuration
3. Add your Vercel URL to "Redirect URLs":
   - Add: `https://your-vercel-url/auth/callback`
   - Example: `https://trading-dashboard-xyz.vercel.app/auth/callback`
4. Save settings

### Enable CORS in Supabase (if needed)

1. In Supabase, go to Project Settings > API
2. Under "CORS Configuration", ensure your Vercel domain is allowed
3. Or use the default `*` for testing

## Step 5: Post-Deployment Testing

### Test Login Flow

1. Visit your production URL
2. Click "Get Started"
3. Create a test account
4. Verify email confirmation (check spam folder)
5. Login with test account
6. Test the dashboard features

### Check Links

- [ ] Home page loads
- [ ] Sign up page works
- [ ] Login page works
- [ ] Password reset works
- [ ] Dashboard loads after login
- [ ] Navigation works
- [ ] Can view stats
- [ ] No console errors

### Verify Database Connection

1. Create a test trade in dashboard
2. Go to Supabase > Table Editor
3. Check `trades` table for your entry
4. If present, database connection works! ✅

## Step 6: Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Your commit message"
git push origin main

# Vercel automatically rebuilds and deploys (2-5 minutes)
# No manual action needed!
```

Monitor deployments in Vercel dashboard under "Deployments" tab.

## Monitoring & Maintenance

### Vercel Dashboard

- Monitor build times and failures
- View function execution logs
- Check analytics and usage
- Manage deployment previews
- Configure custom domains

### Supabase Dashboard

- Monitor API usage
- Check database storage
- Review authentication logs
- View real-time activity
- Manage backups

## Troubleshooting Deployment

### Build Fails on Vercel

```
1. Check Vercel build logs (Deployments > Failed > View logs)
2. Look for errors in build output
3. Ensure all env variables are set
4. Verify .env.local is in .gitignore (don't commit it)
5. Try local build: npm run build
```

### "Cannot find module" Errors

```
1. Check all imports are correct
2. Ensure all dependencies installed: npm install
3. Reinstall: rm -rf node_modules && npm install
4. Rebuild: npm run build
```

### Database Connection Errors

```
1. Verify Supabase URL and API key in env variables
2. Check DATABASE.sql was fully executed
3. Ensure RLS policies exist
4. Test connection: Try creating a trade
5. Check Supabase logs for errors
```

### CORS/Authentication Errors

```
1. Add Vercel URL to Supabase auth redirect URLs
2. Check CORS settings in Supabase
3. Clear browser cache and cookies
4. Try incognito browser window
5. Check browser console for specific errors
```

### Slow Performance

```
1. Check Vercel analytics
2. Review database query performance
3. Optimize images with Next.js Image component
4. Enable caching strategies
5. Consider upgrading Supabase plan if near limits
```

## Custom Domain Setup

### Add Custom Domain to Vercel

1. In Vercel project settings > Domains
2. Click "Add"
3. Enter your domain (e.g., `trading.yourcompany.com`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (24-48 hours)

### Update Supabase Auth URLs

Update auth redirect URLs in Supabase with your custom domain.

## Scaling Tips

- **Database**: Supabase auto-scales, upgrade plan if needed
- **Serverless Functions**: Vercel handles auto-scaling
- **Static Assets**: Vercel CDN caches automatically
- **Monitoring**: Enable analytics on both platforms
- **Backups**: Enable automatic Supabase backups

## Security Checklist

- [ ] Never commit .env.local
- [ ] All env variables configured in Vercel
- [ ] Supabase RLS policies enabled
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Database backups enabled
- [ ] API rate limiting reviewed
- [ ] Regular security updates applied

## Rollback Procedure

If something goes wrong:

### Rollback to Previous Deployment

1. Go to Vercel Deployments tab
2. Find the previous working deployment
3. Click the deployment
4. Click "Promote to Production"
5. Vercel instantly switches to that version

### Rollback Code

```bash
git log # See previous commits
git reset --hard COMMIT_HASH
git push origin main -f # Force push to update Vercel
```

## Going Live Checklist

- [ ] GitHub repository created and pushed
- [ ] Supabase database schema created (DATABASE.sql executed)
- [ ] Vercel project created and connected
- [ ] Environment variables added to Vercel
- [ ] First deployment successful
- [ ] All pages load correctly
- [ ] Authentication flow works (signup/login)
- [ ] Database operations work (create trade)
- [ ] No errors in browser console
- [ ] Responsive design works on mobile
- [ ] Performance is acceptable
- [ ] Supabase URL added to auth redirects
- [ ] Custom domain configured (optional)
- [ ] Monitoring enabled
- [ ] Backups configured

## Need Help?

1. Check Vercel Deployment Logs:
   - Deployments tab > Failed > View logs

2. Check Supabase Logs:
   - Logs > Postgres
   - Authentication > Audit Log

3. Check Browser Console:
   - F12 > Console tab for error messages

4. Verify Environment Variables:
   - Vercel Settings > Environment Variables
   - Ensure all keys are present

5. Test Locally First:
   - npm run dev
   - npm run build
   - Verify everything works before pushing

## Success!

Once all tests pass, your Trading Dashboard is live! 🚀

Your app is now:
- ✅ Deployed to the internet
- ✅ Using cloud database
- ✅ Scaled automatically
- ✅ Backed up regularly
- ✅ HTTPS secured
- ✅ Ready for real users

**Congratulations!** Your professional trading dashboard is live. 📈
