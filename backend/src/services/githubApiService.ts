// services/githubApiService.ts
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  language: string | null;
  size: number;
  updated_at: string;
  default_branch: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed";
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  html_url: string;
  additions: number;
  deletions: number;
  changed_files: number;
}

export interface GitHubFile {
  filename: string;
  status: "added" | "removed" | "modified" | "renamed";
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  patch?: string;
  contents_url: string;
}

export interface GitHubFileContent {
  name: string;
  path: string;
  content: string;
  encoding: "base64" | "utf-8";
  size: number;
  type: "file" | "dir";
  html_url: string;
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export class GitHubApiService {
  private static readonly API_BASE = "https://api.github.com";
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000;

  constructor(private accessToken: string) {}

  /**
   * Make authenticated request to GitHub API
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${GitHubApiService.API_BASE}${endpoint}`;

    for (let attempt = 1; attempt <= GitHubApiService.MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            ...options.headers,
          },
        });

        if (response.ok) {
          return (await response.json()) as T;
        }

        // Handle rate limiting
        if (
          response.status === 403 &&
          response.headers.get("X-RateLimit-Remaining") === "0"
        ) {
          const resetTime = parseInt(
            response.headers.get("X-RateLimit-Reset") || "0"
          );
          const waitTime = resetTime * 1000 - Date.now() + 1000; // Add 1 second buffer

          if (waitTime > 0 && waitTime < 3600000) {
            // Wait max 1 hour
            await this.sleep(waitTime);
            continue;
          }
        }

        throw new Error(
          `GitHub API error: ${response.status} ${response.statusText}`
        );
      } catch (error) {
        if (attempt === GitHubApiService.MAX_RETRIES) {
          throw error;
        }

        await this.sleep(GitHubApiService.RETRY_DELAY * attempt);
      }
    }

    throw new Error("Max retries exceeded");
  }

  /**
   * Get user's repositories
   */
  async getRepositories(
    type: "all" | "owner" | "member" = "owner",
    sort: "created" | "updated" | "pushed" | "full_name" = "updated",
    per_page: number = 30,
    page: number = 1
  ): Promise<GitHubRepository[]> {
    const params = new URLSearchParams({
      type,
      sort,
      direction: "desc",
      per_page: per_page.toString(),
      page: page.toString(),
    });

    return this.makeRequest<GitHubRepository[]>(`/user/repos?${params}`);
  }

  /**
   * Get repository details
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    return this.makeRequest<GitHubRepository>(`/repos/${owner}/${repo}`);
  }

  /**
   * Get repository pull requests
   */
  async getPullRequests(
    owner: string,
    repo: string,
    state: "open" | "closed" | "all" = "open",
    per_page: number = 30,
    page: number = 1
  ): Promise<GitHubPullRequest[]> {
    const params = new URLSearchParams({
      state,
      sort: "updated",
      direction: "desc",
      per_page: per_page.toString(),
      page: page.toString(),
    });

    return this.makeRequest<GitHubPullRequest[]>(
      `/repos/${owner}/${repo}/pulls?${params}`
    );
  }

  /**
   * Get pull request details
   */
  async getPullRequest(
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<GitHubPullRequest> {
    return this.makeRequest<GitHubPullRequest>(
      `/repos/${owner}/${repo}/pulls/${pullNumber}`
    );
  }

  /**
   * Get pull request files
   */
  async getPullRequestFiles(
    owner: string,
    repo: string,
    pullNumber: number,
    per_page: number = 100
  ): Promise<GitHubFile[]> {
    const params = new URLSearchParams({
      per_page: per_page.toString(),
    });

    return this.makeRequest<GitHubFile[]>(
      `/repos/${owner}/${repo}/pulls/${pullNumber}/files?${params}`
    );
  }

  /**
   * Get file content
   */
  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<GitHubFileContent> {
    const params = ref ? `?ref=${encodeURIComponent(ref)}` : "";
    const response = await this.makeRequest<any>(
      `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}${params}`
    );

    if (Array.isArray(response)) {
      throw new Error("Path is a directory, not a file");
    }

    return {
      ...response,
      content:
        response.encoding === "base64"
          ? Buffer.from(response.content, "base64").toString("utf-8")
          : response.content,
      encoding: "utf-8" as const,
    };
  }

  /**
   * Get repository branches
   */
  async getBranches(
    owner: string,
    repo: string,
    per_page: number = 30,
    page: number = 1
  ): Promise<GitHubBranch[]> {
    const params = new URLSearchParams({
      per_page: per_page.toString(),
      page: page.toString(),
    });

    return this.makeRequest<GitHubBranch[]>(
      `/repos/${owner}/${repo}/branches?${params}`
    );
  }

  /**
   * Get repository tree (list files)
   */
  async getTree(
    owner: string,
    repo: string,
    treeSha: string = "HEAD",
    recursive: boolean = false
  ): Promise<{
    tree: Array<{
      path: string;
      type: "blob" | "tree";
      size?: number;
      url: string;
    }>;
  }> {
    const params = recursive ? "?recursive=1" : "";
    return this.makeRequest(
      `/repos/${owner}/${repo}/git/trees/${treeSha}${params}`
    );
  }

  /**
   * Compare two commits/branches
   */
  async compareCommits(
    owner: string,
    repo: string,
    base: string,
    head: string
  ): Promise<{
    files: GitHubFile[];
    commits: Array<{
      sha: string;
      commit: {
        message: string;
        author: {
          name: string;
          email: string;
          date: string;
        };
      };
    }>;
  }> {
    return this.makeRequest(
      `/repos/${owner}/${repo}/compare/${encodeURIComponent(
        base
      )}...${encodeURIComponent(head)}`
    );
  }

  /**
   * Get multiple files content (batch operation)
   */
  async getMultipleFiles(
    owner: string,
    repo: string,
    filePaths: string[],
    ref?: string
  ): Promise<Array<GitHubFileContent | null>> {
    const promises = filePaths.map(async (path) => {
      try {
        return await this.getFileContent(owner, repo, path, ref);
      } catch (error) {
        console.error(`Failed to fetch file ${path}:`, error);
        return null;
      }
    });

    return Promise.all(promises);
  }

  /**
   * Get file content from PR context
   */
  async getPRFileContent(
    owner: string,
    repo: string,
    pullNumber: number,
    filePath: string,
    version: "head" | "base" = "head"
  ): Promise<GitHubFileContent | null> {
    try {
      const pr = await this.getPullRequest(owner, repo, pullNumber);
      const ref = version === "head" ? pr.head.sha : pr.base.sha;

      return await this.getFileContent(owner, repo, filePath, ref);
    } catch (error) {
      console.error(`Failed to fetch PR file content:`, error);
      return null;
    }
  }

  /**
   * Check rate limit status
   */
  async getRateLimit(): Promise<{
    core: {
      limit: number;
      remaining: number;
      reset: number;
    };
  }> {
    return this.makeRequest("/rate_limit");
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Filter files by supported languages
   */
  static filterSupportedFiles(files: GitHubFile[]): GitHubFile[] {
    const supportedExtensions = [
      ".js",
      ".ts",
      ".jsx",
      ".tsx",
      ".py",
      ".java",
      ".go",
      ".rs",
      ".cpp",
      ".c",
      ".cs",
      ".php",
      ".rb",
      ".swift",
      ".kt",
      ".scala",
      ".sh",
      ".yml",
      ".yaml",
      ".json",
      ".html",
      ".css",
      ".sql",
    ];

    return files.filter((file) => {
      if (file.status === "removed") return false;

      const ext = file.filename
        .substring(file.filename.lastIndexOf("."))
        .toLowerCase();
      return supportedExtensions.includes(ext);
    });
  }

  /**
   * Detect language from filename
   */
  static detectLanguage(filename: string): string {
    const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
    const languageMap: Record<string, string> = {
      ".js": "javascript",
      ".jsx": "javascript",
      ".ts": "typescript",
      ".tsx": "typescript",
      ".py": "python",
      ".java": "java",
      ".go": "go",
      ".rs": "rust",
      ".cpp": "cpp",
      ".c": "c",
      ".cs": "csharp",
      ".php": "php",
      ".rb": "ruby",
      ".swift": "swift",
      ".kt": "kotlin",
      ".scala": "scala",
      ".sh": "shell",
      ".yml": "yaml",
      ".yaml": "yaml",
      ".json": "json",
      ".html": "html",
      ".css": "css",
      ".sql": "sql",
    };

    return languageMap[ext] || "other";
  }
}
