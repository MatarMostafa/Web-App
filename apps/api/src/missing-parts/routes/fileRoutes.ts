import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { uploadSingle, uploadMultiple, handleUploadError } from "../middleware/fileUpload";
import {
  uploadFileSchema,
  updateFileSchema,
  deleteFileSchema,
  getFileSchema,
  getEmployeeFilesSchema,
  getOrderFilesSchema,
  getAssignmentFilesSchema,
  getExpiringFilesSchema,
  verifyFileSchema
} from "../validation/fileSchemas";
import {
  uploadFile,
  uploadMultipleFiles,
  downloadFile,
  previewFile,
  getFileDetails,
  getEmployeeFiles,
  getOrderFiles,
  getAssignmentFiles,
  updateFile,
  deleteFile,
  getExpiringFiles,
  verifyFile
} from "../controllers/fileController";

const router = express.Router();

/**
 * @section File Upload/Download Operations
 */

// Upload single file
router.post(
  "/upload",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER", "EMPLOYEE"]),
  uploadSingle,
  handleUploadError,
  validateRequest(uploadFileSchema),
  uploadFile
);

// Upload multiple files
router.post(
  "/upload-multiple",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER", "EMPLOYEE"]),
  uploadMultiple,
  handleUploadError,
  validateRequest(uploadFileSchema),
  uploadMultipleFiles
);

// Download file
router.get(
  "/:id/download",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER", "EMPLOYEE"]),
  validateRequest(getFileSchema),
  downloadFile
);

// Preview file (inline display)
router.get(
  "/:id/preview",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER", "EMPLOYEE"]),
  validateRequest(getFileSchema),
  previewFile
);

// Get file details
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER", "EMPLOYEE"]),
  validateRequest(getFileSchema),
  getFileDetails
);

// Update file metadata
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER"]),
  validateRequest(updateFileSchema),
  updateFile
);

// Delete file
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER"]),
  validateRequest(deleteFileSchema),
  deleteFile
);

// Verify file (HR/Admin only)
router.patch(
  "/:id/verify",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  validateRequest(verifyFileSchema),
  verifyFile
);

/**
 * @section Entity-specific File Operations
 */

// Get files by employee
router.get(
  "/employee/:employeeId",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER", "EMPLOYEE"]),
  validateRequest(getEmployeeFilesSchema),
  getEmployeeFiles
);

// Get files by order
router.get(
  "/order/:orderId",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  validateRequest(getOrderFilesSchema),
  getOrderFiles
);

// Get files by assignment
router.get(
  "/assignment/:assignmentId",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "EMPLOYEE"]),
  validateRequest(getAssignmentFilesSchema),
  getAssignmentFiles
);

/**
 * @section Administrative Operations
 */

// Get expiring files (for notifications)
router.get(
  "/admin/expiring",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  validateRequest(getExpiringFilesSchema),
  getExpiringFiles
);

export default router;