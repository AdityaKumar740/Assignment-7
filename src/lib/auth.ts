import "server-only";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import {
  githubCredentials,
  googleCredentials,
} from "@/lib/auth-options";

const mongoUrl = process.env.MONGODB_URL;
const authUrl = process.env.BETTER_AUTH_URL;
const authSecret = process.env.BETTER_AUTH_SECRET;

if (!mongoUrl) {
  throw new Error("MONGODB_URL must be configured to use authentication.");
}

if (!authUrl) {
  throw new Error("BETTER_AUTH_URL must be configured to use authentication.");
}

if (!authSecret) {
  throw new Error("BETTER_AUTH_SECRET must be configured to use authentication.");
}

const client = new MongoClient(mongoUrl, { maxPoolSize: 5 });
const db = client.db("assignment-7");

export const auth = betterAuth({
  appName: "বাজার দর",
  baseURL: authUrl,
  secret: authSecret,
  trustedOrigins: [authUrl],
  database: mongodbAdapter(db, { client }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    minPasswordLength: 8,
    requireEmailVerification: false,
  },
  socialProviders: {
    ...(googleCredentials
      ? {
          google: {
            clientId: googleCredentials.clientId,
            clientSecret: googleCredentials.clientSecret,
          },
        }
      : {}),
    ...(githubCredentials
      ? {
          github: {
            clientId: githubCredentials.clientId,
            clientSecret: githubCredentials.clientSecret,
          },
        }
      : {}),
  },
});
