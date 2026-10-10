# বাজার দর | BazarDor

BazarDor helps shoppers check everyday product prices across Bangladesh. Browse
the latest prices, compare market ranges, and review price changes before
heading to the bazar.

## Technologies

- [Next.js](https://nextjs.org/) App Router and React
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Better Auth](https://www.better-auth.com/) with MongoDB
- Programming Hero BazarDor products and categories API

## Key features

1. Browse current prices for essential products, with price-change indicators.
2. Explore product categories and sort items by price.
3. View product price summaries and compare market-level minimum, maximum,
   and average prices.
4. Sign in with email and password, Google, or GitHub; manage your profile.
5. Use responsive pages with loading skeletons, friendly 404 handling, and
   authentication feedback.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure the following environment variables in `.env.local`:

   ```dotenv
   BETTER_AUTH_URL=http://localhost:3000
   BETTER_AUTH_SECRET=replace-with-a-long-random-secret
   MONGODB_URL=mongodb+srv://...
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   GITHUB_CLIENT_ID=
   GITHUB_CLIENT_SECRET=
   ```

   OAuth credentials are optional. For enabled providers, set both credentials
   and register these callback URLs in the provider console:

   - Google: `{BETTER_AUTH_URL}/api/auth/callback/google`
   - GitHub: `{BETTER_AUTH_URL}/api/auth/callback/github`

## Deploying to Vercel

1. Import the repository into Vercel and use the default Next.js build settings.
2. Configure `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, and `MONGODB_URL` in the
   Vercel project's Environment Variables. Add the Google and GitHub OAuth
   credentials when those providers are enabled.
3. Set `BETTER_AUTH_URL` to the public origin for the deployment and register
   its `/api/auth/callback/google` and `/api/auth/callback/github` URLs with
   their respective OAuth providers.
4. Redeploy after changing environment variables.

The Better Auth route uses Vercel's Node.js runtime. Public product and
category responses are cached and revalidated periodically; pages that depend
on the signed-in user's session remain request-rendered.

