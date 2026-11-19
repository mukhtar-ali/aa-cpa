import {
    BadRequestException,
    PayloadTooLargeException,
    UnsupportedMediaTypeException,
} from '@nestjs/common';

export const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5 MB

const PDF_MAGIC = Buffer.from('%PDF-');
const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const DOCX_MARKER = Buffer.from('word/document.xml');

export function validateResumeFile(file?: Express.Multer.File | null): void {
    if (!file || !file.buffer) {
        throw new BadRequestException('A resume file (PDF or DOCX) is required');
    }

    const size = typeof file.size === 'number' ? file.size : file.buffer.length;
    if (size > MAX_RESUME_BYTES || file.buffer.length > MAX_RESUME_BYTES) {
        throw new PayloadTooLargeException('Resume file exceeds the 5 MB limit');
    }

    const ext = (file.originalname || '').toLowerCase().split('.').pop();
    const buf = file.buffer;

    const isPdfMagic =
        buf.length >= PDF_MAGIC.length &&
        buf.subarray(0, PDF_MAGIC.length).equals(PDF_MAGIC);

    const isDocxMagic =
        buf.length >= ZIP_MAGIC.length + DOCX_MARKER.length &&
        buf.subarray(0, ZIP_MAGIC.length).equals(ZIP_MAGIC) &&
        buf.includes(DOCX_MARKER);

    if (ext === 'pdf' && isPdfMagic) {
        return;
    }

    if (ext === 'docx' && isDocxMagic) {
        return;
    }

    throw new UnsupportedMediaTypeException(
        'Only valid PDF and DOCX resume files are accepted',
    );
}
