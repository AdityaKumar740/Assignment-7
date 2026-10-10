const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

if (Boolean(googleClientId) !== Boolean(googleClientSecret)) {
  throw new Error(
    "Configure both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET for Google sign-in.",
  );
}

if (Boolean(githubClientId) !== Boolean(githubClientSecret)) {
  throw new Error(
    "Configure both GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET for GitHub sign-in.",
  );
}

export const googleOAuthEnabled = Boolean(
  googleClientId && googleClientSecret,
);
export const githubOAuthEnabled = Boolean(
  githubClientId && githubClientSecret,
);

export const googleCredentials =
  googleClientId && googleClientSecret
    ? { clientId: googleClientId, clientSecret: googleClientSecret }
    : null;

export const githubCredentials =
  githubClientId && githubClientSecret
    ? { clientId: githubClientId, clientSecret: githubClientSecret }
    : null;
