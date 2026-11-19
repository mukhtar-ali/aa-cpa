import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { JobDepartmentForm } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class JobDepartmentsService {
    constructor(private readonly prisma: PrismaService) {}

    async list(query?: any) {
        return this.prisma.jobDepartment.findMany({
            where: { isDeleted: false },
            orderBy: { order: 'asc' },
            include: {
                _count: {
                    select: {
                        jobs: {
                            where: { isDeleted: false, isPublished: true },
                        },
                    },
                },
            },
        });
    }

    async getById(id: string) {
        const dept = await this.prisma.jobDepartment.findUnique({
            where: { id },
        });
        if (!dept || dept.isDeleted) {
            throw new NotFoundException(`Job department not found: ${id}`);
        }
        return dept;
    }

    async create(data: JobDepartmentForm) {
        if (!data.name || typeof data.name !== 'object') {
            throw new BadRequestException('Department name must be a multi-language object.');
        }

        const existing = await this.prisma.jobDepartment.findUnique({
            where: { slug: data.slug },
        });
        if (existing && !existing.isDeleted) {
            throw new BadRequestException(`Department slug "${data.slug}" already exists.`);
        }

        return this.prisma.jobDepartment.create({
            data: {
                slug: data.slug,
                name: data.name as any,
                order: data.order ?? 0,
            },
        });
    }

    async update(id: string, data: JobDepartmentForm) {
        const existing = await this.prisma.jobDepartment.findUnique({
            where: { id },
        });
        if (!existing || existing.isDeleted) {
            throw new NotFoundException(`Job department not found: ${id}`);
        }

        if (data.slug && data.slug !== existing.slug) {
            const conflict = await this.prisma.jobDepartment.findUnique({
                where: { slug: data.slug },
            });
            if (conflict && conflict.id !== id && !conflict.isDeleted) {
                throw new BadRequestException(`Department slug "${data.slug}" already exists.`);
            }
        }

        return this.prisma.jobDepartment.update({
            where: { id },
            data: {
                slug: data.slug,
                name: data.name as any,
                order: data.order ?? 0,
            },
        });
    }

    async delete(id: string) {
        const existing = await this.prisma.jobDepartment.findUnique({
            where: { id },
        });
        if (!existing || existing.isDeleted) {
            throw new NotFoundException(`Job department not found: ${id}`);
        }

        const jobsCount = await this.prisma.job.count({
            where: { departmentId: id, isDeleted: false },
        });

        if (jobsCount > 0) {
            throw new ConflictException(`Cannot delete department because it is referenced by ${jobsCount} job(s).`);
        }

        return this.prisma.jobDepartment.update({
            where: { id },
            data: { isDeleted: true },
        });
    }
}
