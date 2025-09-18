// services/githubOAuthService.ts
import crypto from "crypto";
import serverConfig from "../config/server.config";

export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
}

export interface GitHubTokens {
  access_token: string;
  token_type: string;
  scope: string;
  refresh_token?: string;
}

interface GitHubTokenResponse {
  access_token: string;
  scope: string;
  token_type: string;
  error?: string;
  error_description?: string;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: "public" | "private" | null;
}

export class GitHubOAuthService {
  private static readonly GITHUB_CLIENT_ID = serverConfig.GITHUB_CLIENT_ID;
  private static readonly GITHUB_CLIENT_SECRET =
    serverConfig.GITHUB_CLIENT_SECRET;
  private static readonly REDIRECT_URI = serverConfig.GITHUB_REDIRECT_URI;

  private static readonly GITHUB_API_BASE = "https://api.github.com";
  private static readonly GITHUB_OAUTH_BASE = "https://github.com/login/oauth";

  /**
   * Generate GitHub OAuth authorization URL
   */
  static generateAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.GITHUB_CLIENT_ID!,
      redirect_uri: this.REDIRECT_URI!,
      scope: "repo,user:email,read:user",
      state,
      allow_signup: "true",
    });

    return `${this.GITHUB_OAUTH_BASE}/authorize?${params.toString()}`;
  }

  /**
   * Generate secure state parameter for OAuth
   */
  static generateState(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Exchange authorization code for access token
   */
  static async exchangeCodeForToken(
    code: string,
    state: string
  ): Promise<GitHubTokens> {
    const response = await fetch(`${this.GITHUB_OAUTH_BASE}/access_token`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: this.GITHUB_CLIENT_ID,
        client_secret: this.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: this.REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `GitHub OAuth token exchange failed: ${response.statusText}`
      );
    }

    const tokens = (await response.json()) as GitHubTokenResponse;

    if (tokens.error) {
      throw new Error(
        `GitHub OAuth error: ${tokens.error_description || tokens.error}`
      );
    }

    return tokens;
  }

  /**
   * Get GitHub user information
   */
  static async getGitHubUser(accessToken: string): Promise<GitHubUser> {
    const response = await fetch(`${this.GITHUB_API_BASE}/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch GitHub user: ${response.statusText}`);
    }

    const user = (await response.json()) as GitHubUser;
    return user;
  }

  /**
   * Get user's primary email
   */
  static async getUserEmails(accessToken: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.GITHUB_API_BASE}/user/emails`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      if (!response.ok) {
        return null;
      }

      const emails: GitHubEmail[] = (await response.json()) as GitHubEmail[];
      const primaryEmail = emails.find(
        (email: any) => email.primary && email.verified
      );
      return primaryEmail?.email || null;
    } catch {
      return null;
    }
  }

  /**
   * Validate GitHub token
   */
  static async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.GITHUB_API_BASE}/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Revoke GitHub token
   */
  static async revokeToken(accessToken: string): Promise<void> {
    await fetch(
      `${this.GITHUB_API_BASE}/applications/${this.GITHUB_CLIENT_ID}/token`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${this.GITHUB_CLIENT_ID}:${this.GITHUB_CLIENT_SECRET}`
          ).toString("base64")}`,
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          access_token: accessToken,
        }),
      }
    );
  }

  /**
   * Check if GitHub OAuth is properly configured
   */
  static isConfigured(): boolean {
    return !!(
      process.env.GITHUB_CLIENT_ID &&
      process.env.GITHUB_CLIENT_SECRET &&
      process.env.GITHUB_REDIRECT_URI
    );
  }
}
