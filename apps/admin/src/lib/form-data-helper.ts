/**
 * FormData Helper for Complex Form Submissions
 *
 * Handles mixed content types: JSON objects/arrays, file uploads, and primitive fields.
 * Uses a suffix convention to identify JSON fields that require parsing on the backend.
 *
 * Design Goals:
 * - Proper typing for all input categories
 * - Safe JSON serialization (handles circular references)
 * - Robust edge-case handling (null, undefined, empty arrays)
 */

// ============================================================================
// Types
// ============================================================================

/**
 * A field containing JSON-serializable data (object, array, etc.)
 */
export interface JsonField {
  /** The field key (the helper will automatically append the JSON_SUFFIX) */
  key: string;
  /** The value to stringify - handles objects, arrays, and primitives */
  value: unknown;
}

/**
 * A field containing a file upload
 */
export interface FileField {
  /** The field key for the file upload (e.g., 'heroImage', 'avatar') */
  key: string;
  /** The file to upload. null or undefined values will be skipped. */
  file: File | Blob | null | undefined;
}

/**
 * Simple primitive fields to include in the FormData.
 * These are converted to strings using String().
 */
export type PrimitiveValue = string | number | boolean | null | undefined;
export type PrimitiveFields = Record<string, PrimitiveValue>;

/**
 * Options for building FormData
 */
export interface FormDataOptions {
  /** 
   * Objects or arrays to be JSON-serialized.
   * Field names will have the '_json' suffix appended automatically.
   */
  jsonFields?: JsonField[];
  
  /** 
   * File or Blob uploads.
   * Only valid File/Blob instances are appended; others are ignored.
   */
  fileFields?: FileField[];
  
  /** 
   * Simple key-value pairs.
   * Values are stringified. null/undefined can be optionally skipped or included as empty strings.
   */
  additionalFields?: PrimitiveFields;

  /**
   * How to handle null or undefined values in additionalFields.
   * 'skip' (default): The field is not added to FormData.
   * 'empty': The field is added as an empty string "".
   */
  nullValueHandling?: 'skip' | 'empty';
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Suffix appended to JSON field names.
 * Backend should use this to identify fields requiring JSON.parse().
 */
export const JSON_SUFFIX = '_json';

// ============================================================================
// Helpers
// ============================================================================

/**
 * Safely stringify an object to JSON, handling potential circular references.
 * Circular references are replaced with "[Circular]" to prevent crashing.
 */
function safeJsonStringify(obj: unknown): string {
  const cache = new Set();
  try {
    return JSON.stringify(obj, (_key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          return '[Circular]';
        }
        cache.add(value);
      }
      return value;
    });
  } catch (error) {
    console.error('FormDataHelper: Failed to stringify JSON field', { obj, error });
    return 'null';
  } finally {
    cache.clear();
  }
}

// ============================================================================
// Main Function
// ============================================================================

/**
 * Builds a FormData object from a structured configuration.
 *
 * This utility streamlines the process of sending complex data structures
 * (like arrays of objects) along with file uploads in a single multipart/form-data request.
 *
 * @param options - Configuration for FormData contents
 * @returns A populated FormData instance ready for API submission
 *
 * @example
 * ```typescript
 * const formData = buildFormData({
 *   jsonFields: [
 *     { key: 'tags', value: ['react', 'typescript'] },
 *     { key: 'metadata', value: { author: 'Admin' } }
 *   ],
 *   fileFields: [
 *     { key: 'avatar', file: selectedFile }
 *   ],
 *   additionalFields: {
 *     title: 'Post Title',
 *     publishImmediately: true
 *   }
 * });
 * ```
 */
export function buildFormData(options: FormDataOptions): FormData {
  const formData = new FormData();
  const { 
    jsonFields = [], 
    fileFields = [], 
    additionalFields = {}, 
    nullValueHandling = 'skip' 
  } = options;

  // 1. Process JSON Fields
  jsonFields.forEach(({ key, value }) => {
    // We include empty arrays [] and empty objects {}, but skip undefined
    if (value !== undefined) {
      const fieldName = key.endsWith(JSON_SUFFIX) ? key : `${key}${JSON_SUFFIX}`;
      formData.append(fieldName, safeJsonStringify(value));
    }
  });

  // 2. Process File Fields
  fileFields.forEach(({ key, file }) => {
    if (file instanceof File || file instanceof Blob) {
      formData.append(key, file);
    }
  });

  // 3. Process Primitive Fields
  Object.entries(additionalFields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    } else if (value === null || value === undefined) {
      if (nullValueHandling === 'empty') {
        formData.append(key, '');
      }
      // if 'skip', we do nothing
    }
  });

  return formData;
}
