// controllers/githubController.ts
import type { Request, Response } from "express";
import { GitHubOAuthService } from "../services/githubOAuthService";
import { GitHubApiService } from "../services/githubApiService";
import { GitHubRepository } from "../repositories/githubRepository";
import { ReviewService } from "../services/reviewService";
import { addCodeReviewJob } from "../producers/codeReviewJobProducers";
import { v4 as uuidv4 } from "uuid";
import type { ReviewSubmissionInput } from "../validator/reviewValidator";

export class GitHubController {
  private githubRepository: GitHubRepository;
  private reviewService: ReviewService;

  constructor() {
    this.githubRepository = new GitHubRepository();
    this.reviewService = new ReviewService();
  }

  /**
   * Initiate GitHub OAuth flow
   */
  async initiateOAuth(req: Request, res: Response) {
    try {
      if (!GitHubOAuthService.isConfigured()) {
        return res.status(500).json({
          success: false,
          error: "GitHub OAuth is not properly configured",
        });
      }

      const state = GitHubOAuthService.generateState();
      const authUrl = GitHubOAuthService.generateAuthUrl(state);

      // Store state in session or database for validation
      req.session.githubOAuthState = state;

      return res.json({
        success: true,
        data: {
          authUrl,
          state,
        },
      });
    } catch (error) {
      console.error("GitHub OAuth initiation error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to initiate GitHub OAuth",
      });
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(req: Request, res: Response) {
    try {
      const { code, state } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
      }

      if (!code || !state) {
        return res.status(400).json({
          success: false,
          error: "Missing authorization code or state",
        });
      }

      // Validate state parameter
      if (req.session.githubOAuthState !== state) {
        return res.status(400).json({
          success: false,
          error: "Invalid state parameter",
        });
      }

      // Exchange code for access token
      const tokens = await GitHubOAuthService.exchangeCodeForToken(
        code as string,
        state as string
      );

      // Get GitHub user info
      const githubUser = await GitHubOAuthService.getGitHubUser(
        tokens.access_token
      );
      const email = await GitHubOAuthService.getUserEmails(tokens.access_token);

      // Save GitHub user to database
      await this.githubRepository.createOrUpdateGitHubUser({
        userId,
        githubId: githubUser.id,
        username: githubUser.login,
        email: email || githubUser.email,
        name: githubUser.name,
        avatarUrl: githubUser.avatar_url,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        scope: tokens.scope,
      });

      // Clear OAuth state from session
      delete req.session.githubOAuthState;

      return res.json({
        success: true,
        data: {
          message: "GitHub account connected successfully",
          user: {
            username: githubUser.login,
            name: githubUser.name,
            avatarUrl: githubUser.avatar_url,
          },
        },
      });
    } catch (error) {
      console.error("GitHub OAuth callback error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to connect GitHub account",
      });
    }
  }

  /**
   * Get GitHub connection status
   */
  async getConnectionStatus(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
      }

      const status = await this.githubRepository.getGitHubConnectionStatus(
        userId
      );

      return res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      console.error("Get GitHub connection status error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to get GitHub connection status",
      });
    }
  }

  /**
   * Disconnect GitHub account
   */
  async disconnectAccount(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
      }

      const githubUser = await this.githubRepository.getGitHubUserWithTokens(
        userId
      );
      if (githubUser) {
        // Revoke token on GitHub
        const accessToken = githubUser.getDecryptedAccessToken();
        await GitHubOAuthService.revokeToken(accessToken);
      }

      // Disconnect in database
      await this.githubRepository.disconnectGitHubAccount(userId);

      return res.json({
        success: true,
        data: {
          message: "GitHub account disconnected successfully",
        },
      });
    } catch (error) {
      console.error("Disconnect GitHub account error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to disconnect GitHub account",
      });
    }
  }

  /**
   * Get user's repositories
   */
  async getRepositories(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
      }

      const githubUser = await this.githubRepository.getGitHubUserWithTokens(
        userId
      );
      if (!githubUser) {
        return res.status(404).json({
          success: false,
          error: "GitHub account not connected",
        });
      }

      const accessToken = githubUser.getDecryptedAccessToken();
      const githubApi = new GitHubApiService(accessToken);

      const type = (req.query.type as "all" | "owner" | "member") || "owner";
      const page = parseInt(req.query.page as string) || 1;
      const per_page = Math.min(
        parseInt(req.query.per_page as string) || 30,
        100
      );

      const repositories = await githubApi.getRepositories(
        type,
        "updated",
        per_page,
        page
      );

      return res.json({
        success: true,
        data: {
          repositories: repositories.map((repo) => ({
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description,
            language: repo.language,
            private: repo.private,
            size: repo.size,
            htmlUrl: repo.html_url,
            updatedAt: repo.updated_at,
            defaultBranch: repo.default_branch,
          })),
          pagination: {
            page,
            per_page,
            hasMore: repositories.length === per_page,
          },
        },
      });
    } catch (error) {
      console.error("Get repositories error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch repositories",
      });
    }
  }

  /**
   * Get repository pull requests
   */
  async getRepositoryPullRequests(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { owner, repo } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
      }

      const githubUser = await this.githubRepository.getGitHubUserWithTokens(
        userId
      );
      if (!githubUser) {
        return res.status(404).json({
          success: false,
          error: "GitHub account not connected",
        });
      }

      const accessToken = githubUser.getDecryptedAccessToken();
      const githubApi = new GitHubApiService(accessToken);

      const state = (req.query.state as "open" | "closed" | "all") || "open";
      const page = parseInt(req.query.page as string) || 1;
      const per_page = Math.min(
        parseInt(req.query.per_page as string) || 30,
        100
      );

      const pullRequests = await githubApi.getPullRequests(
        owner,
        repo,
        state,
        per_page,
        page
      );

      return res.json({
        success: true,
        data: {
          pullRequests: pullRequests.map((pr) => ({
            id: pr.id,
            number: pr.number,
            title: pr.title,
            state: pr.state,
            user: {
              login: pr.user.login,
              avatarUrl: pr.user.avatar_url,
            },
            head: pr.head,
            base: pr.base,
            htmlUrl: pr.html_url,
            createdAt: pr.created_at,
            updatedAt: pr.updated_at,
            additions: pr.additions,
            deletions: pr.deletions,
            changedFiles: pr.changed_files,
          })),
          pagination: {
            page,
            per_page,
            hasMore: pullRequests.length === per_page,
          },
        },
      });
    } catch (error) {
      console.error("Get repository PRs error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch pull requests",
      });
    }
  }

  /**
   * Analyze pull request
   */
  async analyzePullRequest(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { owner, repo, pullNumber } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
      }

      const githubUser = await this.githubRepository.getGitHubUserWithTokens(
        userId
      );
      if (!githubUser) {
        return res.status(404).json({
          success: false,
          error: "GitHub account not connected",
        });
      }

      const accessToken = githubUser.getDecryptedAccessToken();
      const githubApi = new GitHubApiService(accessToken);

      // Get PR details and files
      const [pullRequest, files] = await Promise.all([
        githubApi.getPullRequest(owner, repo, parseInt(pullNumber)),
        githubApi.getPullRequestFiles(owner, repo, parseInt(pullNumber)),
      ]);

      // Filter supported files
      const supportedFiles = GitHubApiService.filterSupportedFiles(files);
      if (supportedFiles.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No supported files found in this pull request",
        });
      }

      // Get file contents
      const fileContents = await Promise.all(
        supportedFiles.slice(0, 10).map(async (file) => {
          // Limit to 10 files
          try {
            const content = await githubApi.getPRFileContent(
              owner,
              repo,
              parseInt(pullNumber),
              file.filename,
              "head"
            );
            return content;
          } catch (error) {
            console.error(`Failed to fetch file ${file.filename}:`, error);
            return null;
          }
        })
      );

      const validFiles = fileContents.filter(Boolean);
      if (validFiles.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Failed to fetch file contents",
        });
      }

      // Combine all files into single code block for analysis
      const combinedCode = validFiles
        .map((file) => `// File: ${file!.path}\n${file!.content}`)
        .join("\n\n" + "=".repeat(80) + "\n\n");

      const jobId = uuidv4();

      // Create GitHub analysis record
      await this.githubRepository.createGitHubAnalysis({
        userId,
        githubUserId: githubUser._id.toString(),
        repositoryId: pullRequest.base.repo.id.toString(),
        repositoryName: repo,
        repositoryFullName: `${owner}/${repo}`,
        analysisType: "pull_request",
        pullRequestNumber: parseInt(pullNumber),
        jobId,
        githubMetadata: {
          htmlUrl: pullRequest.html_url,
          lastCommitSha: pullRequest.head.sha,
          lastCommitDate: new Date(pullRequest.updated_at),
          language: pullRequest.base.repo.language || "unknown",
          size: combinedCode.length,
          isPrivate: pullRequest.base.repo.private,
        },
      });

      // Submit to existing review pipeline
      const queueJobData = {
        jobId,
        code: combinedCode,
        language: GitHubApiService.detectLanguage(validFiles[0]!.path),
        filename: `${owner}-${repo}-pr-${pullNumber}.combined`,
        fileSize: Buffer.byteLength(combinedCode, "utf8"),
        userId,
        guestId: undefined,
        priority: 5,
      };

      await addCodeReviewJob(queueJobData, 5);

      return res.json({
        success: true,
        data: {
          jobId,
          message: "Pull request analysis started",
          filesAnalyzing: validFiles.length,
          estimatedTime: Math.max(30, validFiles.length * 10), // seconds
        },
      });
    } catch (error) {
      console.error("Analyze PR error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to analyze pull request",
      });
    }
  }

  /**
   * Analyze single repository file
   */
  async analyzeFile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { owner, repo } = req.params;
      const { filePath, ref } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
      }

      if (!filePath) {
        return res.status(400).json({
          success: false,
          error: "File path is required",
        });
      }

      const githubUser = await this.githubRepository.getGitHubUserWithTokens(
        userId
      );
      if (!githubUser) {
        return res.status(404).json({
          success: false,
          error: "GitHub account not connected",
        });
      }

      const accessToken = githubUser.getDecryptedAccessToken();
      const githubApi = new GitHubApiService(accessToken);

      // Get file content
      const fileContent = await githubApi.getFileContent(
        owner,
        repo,
        filePath as string,
        ref as string
      );

      if (!fileContent || fileContent.type !== "file") {
        return res.status(400).json({
          success: false,
          error: "Invalid file or file not found",
        });
      }

      const jobId = uuidv4();

      // Create GitHub analysis record
      const repository = await githubApi.getRepository(owner, repo);
      await this.githubRepository.createGitHubAnalysis({
        userId,
        githubUserId: githubUser._id.toString(),
        repositoryId: repository.id.toString(),
        repositoryName: repo,
        repositoryFullName: `${owner}/${repo}`,
        analysisType: "file",
        filePaths: [filePath as string],
        jobId,
        githubMetadata: {
          htmlUrl: fileContent.html_url,
          lastCommitSha: (ref as string) || repository.default_branch,
          lastCommitDate: new Date(),
          language:
            repository.language ||
            GitHubApiService.detectLanguage(fileContent.path),
          size: fileContent.size,
          isPrivate: repository.private,
        },
      });

      // Submit to review pipeline
      const queueJobData = {
        jobId,
        code: fileContent.content,
        language: GitHubApiService.detectLanguage(fileContent.path),
        filename: fileContent.name,
        fileSize: fileContent.size,
        userId,
        guestId: undefined,
        priority: 5,
      };

      await addCodeReviewJob(queueJobData, 5);

      return res.json({
        success: true,
        data: {
          jobId,
          message: "File analysis started",
          filename: fileContent.name,
          estimatedTime: 20,
        },
      });
    } catch (error) {
      console.error("Analyze file error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to analyze file",
      });
    }
  }

  /**
   * Get GitHub analysis history
   */
  async getAnalysisHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
      }

      const analysisType = req.query.type as
        | "repository"
        | "pull_request"
        | "file"
        | "branch_comparison";
      const repository = req.query.repository as string;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const offset = parseInt(req.query.offset as string) || 0;

      const analyses = await this.githubRepository.getUserGitHubAnalyses(
        userId,
        {
          analysisType,
          repositoryFullName: repository,
          limit,
          offset,
        }
      );

      return res.json({
        success: true,
        data: {
          analyses: analyses.map((analysis) => ({
            jobId: analysis.jobId,
            repositoryName: analysis.repositoryName,
            repositoryFullName: analysis.repositoryFullName,
            analysisType: analysis.analysisType,
            pullRequestNumber: analysis.pullRequestNumber,
            filePaths: analysis.filePaths,
            summary: analysis.summary,
            createdAt: analysis.createdAt,
            githubMetadata: {
              htmlUrl: analysis.githubMetadata.htmlUrl,
              language: analysis.githubMetadata.language,
              isPrivate: analysis.githubMetadata.isPrivate,
            },
          })),
          pagination: {
            limit,
            offset,
            hasMore: analyses.length === limit,
          },
        },
      });
    } catch (error) {
      console.error("Get analysis history error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch analysis history",
      });
    }
  }

  /**
   * Get user analytics/statistics
   */
  async getAnalytics(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
      }

      const stats = await this.githubRepository.getUserAnalyticsStats(userId);

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Get analytics error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch analytics",
      });
    }
  }
}
