import dotenv from 'dotenv';
import * as process from 'node:process';

dotenv.config();

export const customEnv = {
    APP_PORT: Number(process.env.APP_PORT) || 3001,
    DATABASE_URL: process.env.DATABASE_URL || '',
    JWT_SECRET: process.env.JWT_SECRET || '',
    CSRF_SECRET: process.env.CSRF_SECRET || process.env.JWT_SECRET || '',
    EMAIL_HOST: process.env.EMAIL_HOST || '',
    EMAIL_PORT: Number(process.env.EMAIL_PORT) || 587,
    EMAIL_USERNAME: process.env.EMAIL_USERNAME || '',
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
    EMAIL_FROM: process.env.EMAIL_FROM || '',
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || '',
    S3_BUCKET_ACCESS_KEY_ID: process.env.S3_BUCKET_ACCESS_KEY_ID || '',
    S3_BUCKET_SECRET_ACCESS_KEY: process.env.S3_BUCKET_SECRET_ACCESS_KEY || '',
    S3_BUCKET_REGION: process.env.S3_BUCKET_REGION || '',
    // 'public-read' (default) | 'private' | 'none' - see resolveS3Acl in resource/s3-acl.ts.
    S3_OBJECT_ACL: process.env.S3_OBJECT_ACL || '',
    // S3-compatible stores (Cloudflare R2, MinIO, ...): custom endpoint, path-style addressing, and the public
    // URL prefix used for the returned object links. All optional; unset = plain AWS S3.
    S3_ENDPOINT: process.env.S3_ENDPOINT || '',
    S3_FORCE_PATH_STYLE: process.env.S3_FORCE_PATH_STYLE || '',
    S3_PUBLIC_BASE_URL: process.env.S3_PUBLIC_BASE_URL || '',
    // Where uploads live: 's3' | 'local'. Unset = 's3' when S3_BUCKET_NAME is set, otherwise 'local' (files on this
    // server's disk under UPLOADS_DIR, default <api folder>/storage). See resource/storage/storage-config.ts.
    STORAGE_DRIVER: process.env.STORAGE_DRIVER || '',
    UPLOADS_DIR: process.env.UPLOADS_DIR || '',
    // Public URL of THIS api (no trailing slash needed). The local driver stores absolute file URLs built from it,
    // because the web and admin apps load images from another origin. Defaults to http://localhost:<APP_PORT>
    // outside production; required in production when the local driver is used.
    API_PUBLIC_URL: process.env.API_PUBLIC_URL || '',
    SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || '',
    ADMIN_PORTAL_URL: process.env.ADMIN_PORTAL_URL || 'http://localhost:3002',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};
