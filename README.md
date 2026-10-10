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

## Authentication

Authentication uses Better Auth's server instance in `src/lib/auth.ts`, the
MongoDB adapter, and the Next.js catch-all route at
`/api/auth/[...all]`. The browser uses `createAuthClient` from
`better-auth/react`; email/password and social sign-in requests go through
that client. Profile and protected product pages verify the session on the
server with `auth.api.getSession` and the incoming request headers.

Provider credentials are optional, but each provider requires both its client
ID and client secret. GitHub OAuth apps must also be configured to provide the
user's email address. For Vercel, set `BETTER_AUTH_URL` to the canonical
deployed origin, add all required secrets in the Vercel project settings, and
redeploy after changing them. MongoDB access must be allowed from the
deployment environment; the app uses Node.js for the Better Auth route.

See the official Better Auth guides:

- [Installation and configuration](https://www.better-auth.com/docs/installation)
- [Next.js integration](https://www.better-auth.com/docs/integrations/next)
- [MongoDB adapter](https://www.better-auth.com/docs/adapters/mongo)
- [Email and password](https://www.better-auth.com/docs/authentication/email-password)
- [Google provider](https://www.better-auth.com/docs/authentication/google)
- [GitHub provider](https://www.better-auth.com/docs/authentication/github)

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
