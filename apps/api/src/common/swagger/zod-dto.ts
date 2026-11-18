import { createZodDto } from 'nestjs-zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySchema = any;
type ZodDtoCtor = new (...args: unknown[]) => object;
type ZodDtoClass = ZodDtoCtor;

const dtoCache = new WeakMap<AnySchema, Map<string, ZodDtoClass>>();
const schemaNameCache = new WeakMap<AnySchema, string>();
let autoNameCounter = 1;

const getSchemaName = (schema: AnySchema, name?: string): string => {
    if (name) return name;
    const cached = schemaNameCache.get(schema);
    if (cached) return cached;
    const described = schema.description?.trim();
    const autoName = described && described.length > 0 ? described : `ZodDto_${autoNameCounter++}`;
    schemaNameCache.set(schema, autoName);
    return autoName;
};

const createNamedDto = (schema: AnySchema, name: string) => {
    const BaseDto = createZodDto(schema) as ZodDtoCtor;
    const NamedDto = { [name]: class extends BaseDto {} }[name];
    return NamedDto as ZodDtoClass;
};

export const getZodDto = (schema: AnySchema, name?: string) => {
    const resolvedName = getSchemaName(schema, name);
    let nameMap = dtoCache.get(schema);
    if (!nameMap) { nameMap = new Map(); dtoCache.set(schema, nameMap); }
    let dto = nameMap.get(resolvedName);
    if (!dto) { dto = createNamedDto(schema, resolvedName); nameMap.set(resolvedName, dto); }
    return dto;
};
