import { FileValidator } from '@nestjs/common/pipes/file/file-validator.interface';
import { IFile } from '@nestjs/common/pipes/file/interfaces';

export interface SizeValidatorOptions {
    maxSize: number; // in bytes
    errorMessage?: string;
}

export class SizeValidator extends FileValidator<SizeValidatorOptions, IFile> {
    constructor(options: SizeValidatorOptions) {
        super(options);
    }

    isValid(file?: IFile): boolean {
        if (!file) return true;
        return file.size <= this.validationOptions.maxSize;
    }

    buildErrorMessage(): string {
        return (
            this.validationOptions.errorMessage ||
            `File size should not exceed ${this.validationOptions.maxSize / 1024 / 1024} MB`
        );
    }
}
