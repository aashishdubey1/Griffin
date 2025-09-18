// src/types/express.d.ts

// This is crucial for Express to recognize the custom declaration.
declare namespace Express {
  interface Request {
    // Add custom properties here.
    user?: {
      id: Types.ObjectId;
      // Add other user properties you might attach
    };
    // Assuming your session is a plain object.
    session: {
      githubOAuthState?: string;
      // Add other session properties if you have them.
    };
  }
}
