import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

export default async function setupTestDb() {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
    const databaseUrlTest = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;
    if (!databaseUrlTest) {
        console.warn('DATABASE_URL_TEST or DATABASE_URL not set, skipping test db reset');
        return;
    }

    console.log('Running test database reset for e2e tests...');
    try {
        execSync('npx prisma migrate reset --force --skip-seed', {
            cwd: path.resolve(__dirname, '..'),
            env: {
                ...process.env,
                DATABASE_URL: databaseUrlTest,
            },
            stdio: 'inherit',
        });
    } catch (err) {
        console.warn('Test database reset warning (ignoring if DB server is not running during non-e2e runs):', err);
    }
}
