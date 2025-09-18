import multer from "multer";
import path from "path";
import { FILE_SIZE_LIMITS } from "../validator/reviewValidator";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: FILE_SIZE_LIMITS.MAX_SIZE,
  },
  fileFilter: (req, file, cb) => {
    // Allow common code file extensions
    const allowedExtensions = [
      ".txt",
      ".js",
      ".ts",
      ".py",
      ".java",
      ".cs",
      ".cpp",
      ".c",
      ".go",
      ".rs",
      ".php",
      ".rb",
      ".kt",
      ".swift",
      ".dart",
      ".html",
      ".css",
      ".sql",
      ".sh",
      ".yml",
      ".yaml",
      ".json",
      ".xml",
      ".jsx",
      ".tsx",
    ];

    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      // cb(new Error("Unexpected file "), false);
      throw new Error(
        `Unexpected file type ${ext}. Allowed types are: ${allowedExtensions.join(
          ", "
        )}`
      );
    }
  },
});
