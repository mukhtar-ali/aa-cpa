# Redis + BullMQ Integration Plan

## Why

As this project grows into a full CMS, a job queue becomes necessary for:
- Scheduled content publishing
- Reliable email delivery with retries (currently fire-and-forget)
- Image processing with `sharp` offloaded from the request cycle
- Bulk operations (imports, exports, batch updates)

Adding Redis also unlocks:
- `rate-limiter-flexible` — shared rate limits across multiple server instances
- NestJS cache module — cache heavy read queries (projects, SEO, sections)

---

## Redis in Plain Terms

Redis is an in-memory key-value store. It sits alongside Postgres — it does not replace it.
BullMQ uses it purely as a queue (a to-do list). Your actual data stays in Postgres.

---

## Cost

| Option | Cost | Notes |
|---|---|---|
| Local Docker | Free | `docker run -p 6379:6379 redis` |
| Upstash | Free tier (10k commands/day) | Best for small-to-medium CMS, pay-as-you-go after |
| Redis Cloud | Free 30MB instance | No expiry |
| Railway / Render | ~$5–10/month | Small managed instance |

**Recommendation:** Docker locally, Upstash for production.

---

## Implementation Steps

### 1. Add Redis to Docker Compose (local dev)
```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
```

### 2. Add env variable
```env
REDIS_URL=redis://localhost:6379       # local
REDIS_URL=rediss://...upstash.io:6379  # production (Upstash)
```

### 3. Install packages
```bash
pnpm --filter @repo/api add @nestjs/bullmq bullmq
```

### 4. Register BullMQ in AppModule
```typescript
BullModule.forRoot({
  connection: { url: process.env.REDIS_URL },
}),
BullModule.registerQueue({ name: 'email' }),
```

### 5. Migrate fire-and-forget emails to a proper queue
- Create `EmailProcessor` worker that handles retries
- Replace `.catch()` calls in `users.service.ts` with `this.emailQueue.add(...)`
- Gains: automatic retries, job visibility, failed job tracking

### 6. Switch rate limiting to rate-limiter-flexible
- Replace `@nestjs/throttler` in-memory store with Redis-backed store
- Shared limits work correctly across multiple server instances

### 7. Add caching for heavy reads
- Use `@nestjs/cache-manager` with Redis store
- Cache project listings, SEO data, section data

---

## Files to Touch

- `apps/api/src/app.module.ts` — register BullMQ and cache modules
- `apps/api/src/email/email.service.ts` — become a queue producer
- `apps/api/src/email/email.processor.ts` — new worker file
- `apps/api/src/users/users.service.ts` — use queue instead of fire-and-forget
- `apps/api/src/config/custom-env.ts` — add `REDIS_URL`
- `docker-compose.yml` — add Redis service
