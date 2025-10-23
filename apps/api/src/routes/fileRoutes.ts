import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { uploadSingle, uploadMultiple, handleUploadError } from "../middleware/fileUpload";
import {
  uploadFile,
  uploadMultipleFiles,
  downloadFile,
  getEmployeeFiles,
  deleteFile
} from "../controllers/fileController";
import { previewFile } from "../controllers/fileController";

const router = express.Router();

// Upload single file
router.post(
  "/upload",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER", "EMPLOYEE"]),
  uploadSingle,
  handleUploadError,
  uploadFile
);

// Upload multiple files
router.post(
  "/upload-multiple",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER", "EMPLOYEE"]),
  uploadMultiple,
  handleUploadError,
  uploadMultipleFiles
);

// Download file
router.get(
  "/:id/download",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER", "EMPLOYEE"]),
  downloadFile
);

// Preview file
router.get(
  "/:id/preview",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER", "EMPLOYEE"]),
  previewFile
);

// Get files by employee
router.get(
  "/employee/:employeeId",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER", "EMPLOYEE"]),
  getEmployeeFiles
);

// Delete file
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER"]),
  deleteFile
);

export default router;