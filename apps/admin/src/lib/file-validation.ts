/**
 * File Validation Utilities
 *
 * Client-side validation helpers for file uploads before sending to server.
 * These provide immediate user feedback and reduce unnecessary upload attempts.
 */

// ============================================================================
// Constants
// ============================================================================

/**
 * Maximum file sizes in bytes
 */
export const MAX_FILE_SIZE = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  VIDEO: 50 * 1024 * 1024, // 50MB
} as const;

/**
 * Allowed MIME types for different file categories
 */
export const ALLOWED_MIME_TYPES = {
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  VIDEO: ['video/mp4', 'video/webm', 'video/quicktime'],
} as const;

// ============================================================================
// Types
// ============================================================================

export interface FileValidationError {
  valid: false;
  error: string;
}

export interface FileValidationSuccess {
  valid: true;
  file: File;
}

export type FileValidationResult = FileValidationError | FileValidationSuccess;

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate file size
 *
 * @param file - The file to validate
 * @param maxSize - Maximum allowed size in bytes (default: 5MB for images)
 * @returns Validation result
 *
 * @example
 * const result = validateFileSize(file, MAX_FILE_SIZE.IMAGE);
 * if (!result.valid) {
 *   toast.error(result.error);
 *   return;
 * }
 */
export function validateFileSize(
  file: File,
  maxSize: number = MAX_FILE_SIZE.IMAGE
): FileValidationResult {
  if (file.size > maxSize) {
    const sizeMB = (maxSize / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `File size must be less than ${sizeMB}MB`,
    };
  }

  return { valid: true, file };
}

/**
 * Validate file MIME type
 *
 * @param file - The file to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns Validation result
 *
 * @example
 * const result = validateFileType(file, ALLOWED_MIME_TYPES.IMAGE);
 * if (!result.valid) {
 *   toast.error(result.error);
 *   return;
 * }
 */
export function validateFileType(
  file: File,
  allowedTypes: readonly string[]
): FileValidationResult {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`,
    };
  }

  return { valid: true, file };
}

/**
 * Validate image file (size and type)
 *
 * @param file - The file to validate
 * @param maxSize - Maximum allowed size in bytes (default: 5MB)
 * @returns Validation result
 *
 * @example
 * const result = validateImageFile(file);
 * if (!result.valid) {
 *   toast.error(result.error);
 *   return;
 * }
 */
export function validateImageFile(
  file: File,
  maxSize: number = MAX_FILE_SIZE.IMAGE
): FileValidationResult {
  // Check file type
  const typeResult = validateFileType(file, ALLOWED_MIME_TYPES.IMAGE);
  if (!typeResult.valid) {
    return typeResult;
  }

  // Check file size
  return validateFileSize(file, maxSize);
}

/**
 * Validate multiple images at once
 *
 * @param files - Array of files to validate
 * @param maxSize - Maximum allowed size per file in bytes
 * @returns Object with valid files and any errors
 *
 * @example
 * const result = validateMultipleImages(files);
 * if (result.errors.length > 0) {
 *   result.errors.forEach(err => toast.error(err));
 * }
 * result.validFiles.forEach(file => uploadFile(file));
 */
export function validateMultipleImages(
  files: File[],
  maxSize: number = MAX_FILE_SIZE.IMAGE
): { validFiles: File[]; errors: string[] } {
  const validFiles: File[] = [];
  const errors: string[] = [];

  files.forEach((file, index) => {
    const result = validateImageFile(file, maxSize);
    if (result.valid) {
      validFiles.push(result.file);
    } else {
      errors.push(`File ${index + 1}: ${result.error}`);
    }
  });

  return { validFiles, errors };
}

/**
 * Format file size for display
 *
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 *
 * @example
 * formatFileSize(5242880); // "5 MB"
 * formatFileSize(1024); // "1 KB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
