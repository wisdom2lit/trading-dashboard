# Quick Start Guide

Get your Trading Dashboard running in 5 minutes!

## TL;DR (The Super Quick Version)

```bash
# 1. Ensure database is created
# Go to Supabase > SQL Editor > Run DATABASE.sql from this project

# 2. Start developing
cd c:\Users\Admin\Documents\trading-dashboard
npm run dev

# 3. Open browser
# Visit http://localhost:3000

# 4. Sign up and test
# Create an account, explore the dashboard

# 5. Deploy when ready
# Push to GitHub and connect Vercel
```

## Before You Start

✅ **Do This First**: 
1. Open [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Copy all content from `DATABASE.sql` file
4. Run it in Supabase (this creates all tables)

❌ **Don't Forget**: The app needs the database to work!

## Development Commands

```bash
# Start development server (with auto-reload)
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Run linting
npm run lint

# Format code (if prettier is configured)
npm run format
```

## Project Structure at a Glance

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── layout.tsx            # Root template
│   ├── globals.css           # Global styles
│   ├── dashboard/            # Authenticated user dashboard
│   ├── auth/                 # Login, signup, password reset
│   └── api/                  # API endpoints
├── lib/
│   ├── supabase.ts           # Database client
│   └── types.ts              # TypeScript types
└── middleware.ts             # Route protection
```

## Key Features to Try

### 1. Sign Up (http://localhost:3000/auth/signup)
- Create account with email
- Password must be 8+ characters
- Confirm by clicking link (or use Supabase anon key)

### 2. Login (http://localhost:3000/auth/login)
- Use credentials from signup
- Session stays logged in

### 3. Dashboard (http://localhost:3000/dashboard)
- View account statistics
- See recent trades
- Navigate with tabs

### 4. API Testing (http://localhost:3000/api/trades)
- GET `/api/trades` - List all trades
- POST `/api/trades` - Create new trade
- PATCH `/api/trades/[id]` - Update trade
- DELETE `/api/trades/[id]` - Delete trade

## Common Tasks

### Add a New Page
```bash
# Create new page file
# src/app/new-feature/page.tsx

export default function NewFeature() {
  return <div>Your content here</div>
}

# Automatically available at /new-feature
```

### Add a New API Route
```bash
# src/app/api/new-endpoint/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Hello' });
}

# Accessible at /api/new-endpoint
```

### Styling Components
```tsx
// Use Tailwind classes
<div className="bg-blue-500 p-4 rounded-lg">
  Styled with Tailwind
</div>

// Or CSS

<div className="glass-card">
  Glass morphism style
</div>
```

### Connect to Database
```tsx
import { supabase } from '@/lib/supabase';

// Fetch data
const { data, error } = await supabase
  .from('trades')
  .select('*');

// Insert data
const { data, error } = await supabase
  .from('trades')
  .insert([{ symbol: 'EURUSD', direction: 'Long' }]);
```

## Debugging Tips

### Browser Console
- Open F12 or right-click > Inspect
- Go to Console tab
- Look for error messages
- Check Network tab for API calls

### Terminal/IDE
- Check terminal for build errors
- Look for red error messages
- Search for line numbers mentioned

### Supabase Dashboard
- Go to Logs > Postgres
- Check if database operations are being logged
- Look for RLS policy violations

### Environment Variables
- Verify `.env.local` exists in root
- Check values are not empty
- Restart dev server after changes

## Performance Tips

- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh page (Ctrl+Shift+R or Cmd+Shift+R)
- Check network throttling in DevTools
- Monitor function execution time

## Customization Ideas

### Change Colors
Edit `src/app/globals.css`:
```css
:root {
  --accent-green: #00d98e;  /* Change this color */
  --accent-blue: #0099ff;   /* And this */
}
```

### Change Fonts
Update `src/app/layout.tsx` to import different fonts

### Add More Pages
Create new folders in `src/app/` with `page.tsx` files

### Add Database Tables
- Design in `DATABASE.sql`
- Copy to Supabase SQL Editor
- Update `src/lib/types.ts` with new types
- Create new API routes

## Deployment (When Ready)

```bash
# Push to GitHub
git add .
git commit -m "Your message"
git push origin main

# Then go to vercel.com and import your GitHub repo
# Add environment variables
# Deploy!
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed steps.

## Useful Links

- [Next.js Docs](https://nextjs.org/docs) - Framework documentation
- [Supabase Docs](https://supabase.com/docs) - Database & auth
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [React Docs](https://react.dev) - JavaScript library
- [TypeScript](https://www.typescriptlang.org/docs/) - Type safety
- [Framer Motion](https://www.framer.com/motion/) - Animations

## Getting Stuck?

1. **Does it work locally?** - `npm run dev`
2. **Are you logged in?** - Check dashboard page
3. **Database created?** - Check Supabase > Tables
4. **Any console errors?** - F12 > Console tab
5. **Environment variables set?** - Check `.env.local`

## What's Next?

- Add more features (checklist, journal, charts)
- Customize styling to match your brand
- Deploy to Vercel
- Add more database functionality
- Invite beta testers
- Gather feedback
- Iterate and improve

---

**Happy Coding!** Questions? Check the README.md and DEPLOYMENT.md files. 🚀
