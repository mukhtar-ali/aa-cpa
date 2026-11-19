import {
    PayloadTooLargeException,
    UnsupportedMediaTypeException,
} from '@nestjs/common';
import { validateResumeFile, MAX_RESUME_BYTES } from './resume-validator';

describe('validateResumeFile (magic bytes & size)', () => {
    const makePdfBuffer = () => Buffer.from('%PDF-1.7\n1 0 obj\n<<>>\nendobj\n');
    const makeDocxBuffer = () => {
        // PK\x03\x04 header + word/document.xml marker inside zip central directory
        const header = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00]);
        const marker = Buffer.from('word/document.xml');
        return Buffer.concat([header, marker]);
    };

    it('accepts a valid PDF file with %PDF- magic bytes', () => {
        const buf = makePdfBuffer();
        expect(() =>
            validateResumeFile({
                originalname: 'cv.pdf',
                mimetype: 'application/pdf',
                size: buf.length,
                buffer: buf,
            } as any),
        ).not.toThrow();
    });

    it('accepts a valid DOCX file with PK zip header and word/document.xml entry', () => {
        const buf = makeDocxBuffer();
        expect(() =>
            validateResumeFile({
                originalname: 'resume.docx',
                mimetype:
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                size: buf.length,
                buffer: buf,
            } as any),
        ).not.toThrow();
    });

    it('rejects an executable disguised with .pdf extension (415 UnsupportedMediaTypeException)', () => {
        const exeBuf = Buffer.from('MZ\x90\x00\x03\x00\x00\x00This program cannot be run');
        expect(() =>
            validateResumeFile({
                originalname: 'malware.pdf',
                mimetype: 'application/pdf',
                size: exeBuf.length,
                buffer: exeBuf,
            } as any),
        ).toThrow(UnsupportedMediaTypeException);
    });

    it('rejects a regular ZIP file that does not contain word/document.xml disguised as .docx', () => {
        const zipBuf = Buffer.concat([
            Buffer.from([0x50, 0x4b, 0x03, 0x04]),
            Buffer.from('archive/readme.txt'),
        ]);
        expect(() =>
            validateResumeFile({
                originalname: 'archive.docx',
                mimetype: 'application/zip',
                size: zipBuf.length,
                buffer: zipBuf,
            } as any),
        ).toThrow(UnsupportedMediaTypeException);
    });

    it('rejects files exceeding 5 MB (413 PayloadTooLargeException)', () => {
        const buf = makePdfBuffer();
        expect(() =>
            validateResumeFile({
                originalname: 'huge.pdf',
                mimetype: 'application/pdf',
                size: MAX_RESUME_BYTES + 1,
                buffer: buf,
            } as any),
        ).toThrow(PayloadTooLargeException);
    });
});
