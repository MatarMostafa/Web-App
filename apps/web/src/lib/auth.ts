import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import jwt from "jsonwebtoken";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

async function refreshAccessToken(token: any) {
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.accessToken,
      accessTokenExpires: Date.now() + 60 * 60 * 1000, // 1 hour
      refreshToken: refreshedTokens.refreshToken ?? token.refreshToken,
    };
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  secret:
    process.env.NEXTAUTH_SECRET ||
    "a0a2e548d9494526a468e7766d7aebc7ee83d1fafc5a8b119f86067f962a060e",
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('NextAuth authorize called with:', credentials);
        
        if (!credentials?.identifier || !credentials?.password) {
          console.log('Missing credentials in NextAuth');
          return null;
        }

        try {
          console.log('Making request to:', `${API_URL}/api/auth/login`);
          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              identifier: credentials.identifier,
              password: credentials.password,
            }),
          });

          console.log('API response status:', response.status);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.log('API error response:', errorData);
            
            // Throw specific errors that can be caught by NextAuth
            if (response.status === 429) {
              throw new Error('RATE_LIMIT');
            } else if (response.status === 403) {
              // 403 status for blocked users - pass through the specific message
              throw new Error(errorData.message || 'ACCESS_DENIED');
            } else if (response.status === 401) {
              // 401 for invalid credentials
              throw new Error('INVALID_CREDENTIALS');
            } else if (response.status === 400) {
              throw new Error(errorData.message || 'BAD_REQUEST');
            } else {
              throw new Error(errorData.message || 'LOGIN_FAILED');
            }
          }

          const data = await response.json();
          console.log("NextAuth login success data:", data);
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.username,
            role: data.user.role,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          };
        } catch (error: any) {
          console.log('NextAuth authorize error:', error.message);
          // Pass the error message to NextAuth
          throw new Error(error.message || 'LOGIN_FAILED');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.role = user.role;
        token.accessTokenExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.role = token.role as string;
      session.accessToken = token.accessToken as string;
      session.error = token.error as string;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle role-based redirects after login
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Default redirects based on role will be handled in middleware
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
};
