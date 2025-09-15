// Language detection helper
export const detectLanguageFromFilename = (filename: string): string => {
  const extension = filename.split(".").pop()?.toLowerCase();

  const extensionMap: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    java: "java",
    cs: "csharp",
    cpp: "cpp",
    cxx: "cpp",
    c: "c",
    go: "go",
    rs: "rust",
    php: "php",
    rb: "ruby",
    kt: "kotlin",
    swift: "swift",
    dart: "dart",
    html: "html",
    htm: "html",
    css: "css",
    scss: "css",
    sass: "css",
    sql: "sql",
    sh: "shell",
    bash: "shell",
    yml: "yaml",
    yaml: "yaml",
    json: "json",
    xml: "xml",
  };

  return extensionMap[extension || ""] || "other";
};

// Code complexity estimation
export const estimateProcessingTime = (
  code: string,
  language: string
): number => {
  const lines = code.split("\n").length;
  const characters = code.length;

  // Base time in milliseconds
  let baseTime = 2000; // 2 seconds base

  // Add time based on code size
  baseTime += Math.floor(lines / 10) * 100; // 100ms per 10 lines
  baseTime += Math.floor(characters / 1000) * 50; // 50ms per 1000 characters

  // Language-specific multipliers
  const languageMultipliers: Record<string, number> = {
    cpp: 1.5,
    java: 1.3,
    csharp: 1.3,
    python: 1.2,
    typescript: 1.1,
    javascript: 1.0,
    go: 1.1,
    rust: 1.4,
    other: 0.8,
  };

  const multiplier = languageMultipliers[language] || 1.0;
  return Math.floor(baseTime * multiplier);
};
