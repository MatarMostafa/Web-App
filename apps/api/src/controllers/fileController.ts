import { Request, Response } from "express";
import * as fileService from "../services/fileService";
import { DocumentType } from "@repo/db";
import fs from "fs";
import path from "path";

// Upload file
export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const {
      documentType,
      description,
      expiryDate,
      employeeId,
      orderId,
      assignmentId,
      isPublic
    } = req.body;

    const fileData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      documentType: documentType as DocumentType,
      description,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      employeeId,
      orderId,
      assignmentId,
      uploadedBy: (req as any).user?.id,
      isPublic: isPublic === 'true'
    };

    const file = await fileService.createFileService(fileData);

    res.status(201).json({
      message: "File uploaded successfully",
      file
    });
  } catch (error) {
    console.error("Upload file error:", error);
    res.status(500).json({
      message: "Failed to upload file",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Upload multiple files
export const uploadMultipleFiles = async (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const {
      documentType,
      description,
      expiryDate,
      employeeId,
      orderId,
      assignmentId,
      isPublic
    } = req.body;

    const uploadedFiles = [];

    for (const file of req.files) {
      const fileData = {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        documentType: documentType as DocumentType,
        description,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        employeeId,
        orderId,
        assignmentId,
        uploadedBy: (req as any).user?.id,
        isPublic: isPublic === 'true'
      };

      const uploadedFile = await fileService.createFileService(fileData);
      uploadedFiles.push(uploadedFile);
    }

    res.status(201).json({
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles
    });
  } catch (error) {
    console.error("Upload multiple files error:", error);
    res.status(500).json({
      message: "Failed to upload files",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Download file
export const downloadFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const file = await fileService.getFileByIdService(id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check if file exists on disk
    if (!fs.existsSync(file.path)) {
      return res.status(404).json({ message: "File not found on disk" });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Length', file.size.toString());

    // Stream the file
    const fileStream = fs.createReadStream(file.path);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Download file error:", error);
    res.status(500).json({
      message: "Failed to download file",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Preview file
export const previewFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const file = await fileService.getFileByIdService(id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (!fs.existsSync(file.path)) {
      return res.status(404).json({ message: "File not found on disk" });
    }

    // Set headers for inline display
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);

    const fileStream = fs.createReadStream(file.path);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Preview file error:", error);
    res.status(500).json({
      message: "Failed to preview file",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Get employee files
export const getEmployeeFiles = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const files = await fileService.getFilesByEmployeeService(employeeId);
    res.json(files);
  } catch (error) {
    console.error("Get employee files error:", error);
    res.status(500).json({
      message: "Failed to get employee files",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Delete file
export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await fileService.deleteFileService(id);

    res.json({
      message: "File deleted successfully"
    });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({
      message: "Failed to delete file",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};