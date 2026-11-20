import type { Server } from 'http';

export interface SupertestResponse {
    status: number;
    statusCode: number;
    body: any;
    text: string;
    headers: Record<string, string>;
}

export class TestRequest implements PromiseLike<SupertestResponse> {
    private method: string;
    private path: string;
    private server: Server;
    private reqHeaders: Record<string, string> = {};
    private jsonBody: any = undefined;
    private fields: Array<[string, string]> = [];
    private files: Array<{ name: string; buffer: Buffer; filename?: string }> = [];
    private expectedStatus?: number;
    private expectedHeader?: [string, string | RegExp];

    constructor(server: Server, method: string, path: string) {
        this.server = server;
        this.method = method.toUpperCase();
        this.path = path;
    }

    set(nameOrObj: string | Record<string, string>, val?: string) {
        if (typeof nameOrObj === 'string') {
            this.reqHeaders[nameOrObj.toLowerCase()] = val ?? '';
        } else if (nameOrObj) {
            for (const [k, v] of Object.entries(nameOrObj)) {
                this.reqHeaders[k.toLowerCase()] = v;
            }
        }
        return this;
    }

    send(data: any) {
        this.jsonBody = data;
        return this;
    }

    field(name: string, value: any) {
        this.fields.push([name, String(value)]);
        return this;
    }

    attach(name: string, fileOrPath: Buffer | string, filename = 'file.bin') {
        const buffer = Buffer.isBuffer(fileOrPath)
            ? fileOrPath
            : Buffer.from(fileOrPath);
        this.files.push({ name, buffer, filename });
        return this;
    }

    expect(statusOrHeader: number | string, value?: string | RegExp) {
        if (typeof statusOrHeader === 'number') {
            this.expectedStatus = statusOrHeader;
        } else if (typeof statusOrHeader === 'string' && value !== undefined) {
            this.expectedHeader = [statusOrHeader, value];
        }
        return this;
    }

    private async execute(): Promise<SupertestResponse> {
        if (!this.server.listening) {
            await new Promise<void>((resolve) => this.server.listen(0, resolve));
        }
        const address = this.server.address();
        const port = typeof address === 'string' ? address : address?.port;
        const url = `http://127.0.0.1:${port}${this.path}`;

        let body: any = undefined;
        const headers: Record<string, string> = { ...this.reqHeaders };

        if (this.files.length > 0 || this.fields.length > 0) {
            const formData = new FormData();
            for (const [k, v] of this.fields) {
                formData.append(k, v);
            }
            for (const f of this.files) {
                const blob = new Blob([f.buffer]);
                formData.append(f.name, blob, f.filename);
            }
            body = formData;
            delete headers['content-type'];
        } else if (this.jsonBody !== undefined) {
            if (typeof this.jsonBody === 'string') {
                body = this.jsonBody;
            } else {
                body = JSON.stringify(this.jsonBody);
                if (!headers['content-type']) {
                    headers['content-type'] = 'application/json';
                }
            }
        }

        const res = await fetch(url, {
            method: this.method,
            headers,
            body,
            redirect: 'manual',
        });

        const arrayBuffer = await res.arrayBuffer();
        const text = Buffer.from(arrayBuffer).toString('utf-8');
        let parsedBody: any = {};
        try {
            parsedBody = JSON.parse(text);
        } catch {
            parsedBody = text;
        }

        const resHeaders: Record<string, string> = {};
        res.headers.forEach((v, k) => {
            resHeaders[k.toLowerCase()] = v;
        });

        const result: SupertestResponse = {
            status: res.status,
            statusCode: res.status,
            body: parsedBody,
            text,
            headers: resHeaders,
        };

        if (this.expectedStatus !== undefined && result.status !== this.expectedStatus) {
            throw new Error(`Expected status ${this.expectedStatus} but got ${result.status}: ${text}`);
        }
        if (this.expectedHeader) {
            const [hName, hVal] = this.expectedHeader;
            const actual = resHeaders[hName.toLowerCase()];
            if (typeof hVal === 'string' && actual !== hVal) {
                throw new Error(`Expected header ${hName} to be ${hVal} but got ${actual}`);
            } else if (hVal instanceof RegExp && !hVal.test(actual || '')) {
                throw new Error(`Expected header ${hName} to match ${hVal} but got ${actual}`);
            }
        }

        return result;
    }

    then<TResult1 = SupertestResponse, TResult2 = never>(
        onfulfilled?: ((value: SupertestResponse) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
    ): Promise<TResult1 | TResult2> {
        return this.execute().then(onfulfilled, onrejected);
    }
}

export default function request(server: any) {
    const s = typeof server?.getHttpServer === 'function' ? server.getHttpServer() : server;
    return {
        get: (path: string) => new TestRequest(s, 'GET', path),
        post: (path: string) => new TestRequest(s, 'POST', path),
        put: (path: string) => new TestRequest(s, 'PUT', path),
        patch: (path: string) => new TestRequest(s, 'PATCH', path),
        delete: (path: string) => new TestRequest(s, 'DELETE', path),
    };
}
