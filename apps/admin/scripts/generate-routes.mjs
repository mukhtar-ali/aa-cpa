// Regenerates src/routeTree.gen.ts without starting Vite (used after deleting route files).
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Generator, getConfig } from '@tanstack/router-generator'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const config = getConfig({ target: 'react', autoCodeSplitting: true }, root)
const generator = new Generator({ config, root })
await generator.run()
console.log('routeTree.gen.ts regenerated')
