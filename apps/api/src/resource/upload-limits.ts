/**
 * Hard caps for admin uploads. They are enforced by multer (`limits.fileSize`), which aborts an
 * oversized upload while it streams in. A pipe validator alone is not enough: it only runs after
 * multer has already buffered the WHOLE file in memory.
 */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB (images are re-encoded to webp afterwards)
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB
export const MAX_PDF_BYTES = 20 * 1024 * 1024; // 20 MB
