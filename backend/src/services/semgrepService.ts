import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { v4 as uuidv4 } from "uuid";

export interface SemgrepFinding {
  check_id: string;
  path: string;
  start: {
    line: number;
    col: number;
  };
  end: {
    line: number;
    col: number;
  };
  message: string;
  severity: "ERROR" | "WARNING" | "INFO";
  metadata?: {
    category?: string;
    cwe?: string[];
    owasp?: string[];
    confidence?: "HIGH" | "MEDIUM" | "LOW";
  };
  extra?: {
    lines: string;
    message: string;
  };
}

export interface SemgrepResult {
  results: SemgrepFinding[];
  errors: Array<{
    message: string;
    path: string;
  }>;
}

export class SemgrepService {
  private static readonly TIMEOUT_MS = 30000; // 30 seconds
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  /**
   * Analyze code using Semgrep static analysis
   */
  async analyze(
    code: string,
    language: string,
    filename?: string
  ): Promise<SemgrepResult> {
    // Validate input
    if (code.length > SemgrepService.MAX_FILE_SIZE) {
      throw new Error(
        `Code size exceeds maximum limit of ${SemgrepService.MAX_FILE_SIZE} bytes`
      );
    }

    let tempFilePath: string | null = null;

    try {
      // Create temporary file

      tempFilePath = await this.createTempFile(code, language, filename);

      // Run Semgrep analysis
      const result = await this.runSemgrepAnalysis(tempFilePath);

      return result;
    } catch (error) {
      console.error("Semgrep analysis failed:", error);
      throw new Error(
        `Static analysis failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      // Clean up temporary file
      if (tempFilePath) {
        await this.cleanupTempFile(tempFilePath);
      }
    }
  }

  /**
   * Create temporary file for analysis
   */
  private async createTempFile(
    code: string,
    language: string,
    filename?: string
  ): Promise<string> {
    const fileExtension = this.getFileExtension(language, filename);
    const tempFileName = `semgrep_${uuidv4()}${fileExtension}`;
    const tempFilePath = join(tmpdir(), tempFileName);

    await writeFile(tempFilePath, code, "utf8");
    return tempFilePath;
  }

  /**
   * Get appropriate file extension based on language
   */
  private getFileExtension(language: string, filename?: string): string {
    if (filename) {
      const ext = filename.substring(filename.lastIndexOf("."));
      if (ext) return ext;
    }

    const extensionMap: Record<string, string> = {
      javascript: ".js",
      typescript: ".ts",
      python: ".py",
      java: ".java",
      go: ".go",
      rust: ".rs",
      cpp: ".cpp",
      c: ".c",
      csharp: ".cs",
      php: ".php",
      ruby: ".rb",
      swift: ".swift",
      kotlin: ".kt",
      scala: ".scala",
      shell: ".sh",
      yaml: ".yml",
      json: ".json",
      html: ".html",
      css: ".css",
      sql: ".sql",
    };

    return extensionMap[language.toLowerCase()] || ".txt";
  }

  /**
   * Execute Semgrep analysis
   */
  private async runSemgrepAnalysis(filePath: string): Promise<SemgrepResult> {
    try {
      // Run semgrep with comprehensive ruleset
      const proc = Bun.spawn(
        [
          "semgrep",
          "--json",
          "--config=auto", // Use Semgrep's curated ruleset
          "--config=p/security-audit", // Security-focused rules
          "--config=p/owasp-top-ten", // OWASP Top 10 rules
          "--timeout=30",
          "--no-git-ignore",
          "--disable-version-check",
          filePath,
        ],
        {
          stdout: "pipe",
          stderr: "pipe",
        }
      );

      // Set timeout
      const timeoutId = setTimeout(() => {
        proc.kill();
      }, SemgrepService.TIMEOUT_MS);

      // Wait for completion
      const exitCode = await proc.exited;
      clearTimeout(timeoutId);

      // Read output
      const stdout = await new Response(proc.stdout).text();
      const stderr = await new Response(proc.stderr).text();

      // Handle different exit codes
      if (exitCode === 0 || exitCode === 1) {
        // Exit code 0: No findings, Exit code 1: Findings found
        return this.parseSemgrepOutput(stdout);
      } else {
        console.error("Semgrep stderr:", stderr);
        throw new Error(`Semgrep exited with code ${exitCode}: ${stderr}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("timeout")) {
        throw new Error(
          "Analysis timed out. File may be too large or complex."
        );
      }
      throw error;
    }
  }

  /**
   * Parse Semgrep JSON output
   */
  private parseSemgrepOutput(output: string): SemgrepResult {
    try {
      if (!output.trim()) {
        return { results: [], errors: [] };
      }

      const parsed = JSON.parse(output);

      // Validate the structure
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid Semgrep output format");
      }

      return {
        results: Array.isArray(parsed.results) ? parsed.results : [],
        errors: Array.isArray(parsed.errors) ? parsed.errors : [],
      };
    } catch (error) {
      console.error("Failed to parse Semgrep output:", output);
      throw new Error(
        `Failed to parse analysis results: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Clean up temporary file
   */
  private async cleanupTempFile(filePath: string): Promise<void> {
    try {
      await unlink(filePath);
    } catch (error) {
      console.warn(`Failed to cleanup temp file ${filePath}:`, error);
    }
  }

  /**
   * Check if Semgrep is available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const proc = Bun.spawn(["semgrep", "--version"], {
        stdout: "pipe",
        stderr: "pipe",
      });

      const exitCode = await proc.exited;
      return exitCode === 0;
    } catch {
      return false;
    }
  }

  /**
   * Get supported languages by Semgrep
   */
  static getSupportedLanguages(): string[] {
    return [
      "javascript",
      "typescript",
      "python",
      "java",
      "go",
      "rust",
      "cpp",
      "c",
      "csharp",
      "php",
      "ruby",
      "swift",
      "kotlin",
      "scala",
      "shell",
      "yaml",
      "json",
      "html",
      "css",
      "sql",
    ];
  }
}
