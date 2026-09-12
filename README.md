# Bike Shop

An interactive bicycle builder MVP. Select a frame, wheelset, and groupset to see a layered bike visualization, live pricing, weight, and compatibility feedback.

## Run locally

Install Node.js 20 or newer, then run:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## MVP architecture

- `src/types`: domain models for products and builds
- `src/data`: demo product catalog kept separate from UI
- `src/lib/compatibility`: small rule-based compatibility engine
- `src/lib/pricing`: subtotal calculation
- `src/components`: visualizer, product browser, and build summary
- `src/app`: Next.js app shell

The first vertical slice covers frame, wheelset, and groupset. More categories can be added to the same catalog and build model without changing the pricing or compatibility boundaries.

## Publish a public URL

The app is ready for Vercel deployment. The simplest workflow is:

1. Create a new GitHub repository and upload this project.
2. Sign in at https://vercel.com and choose **Add New Project**.
3. Import the GitHub repository.
4. Keep the detected Next.js settings and click **Deploy**.

Vercel will provide a public `vercel.app` URL. Every later push to the repository will automatically publish a new version.

The catalog currently contains demo data. Product prices, availability, and images should be reviewed before using the site commercially.
