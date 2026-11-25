# Restore drill, rollback drill and alert drill (T011, T011a, T009)

Status: **NOT RUN.** Needs a real staging VPS. Procedures: `deploy/vps/backup/restore.md`,
`docs/launch/monitoring.md` §4, and the rollback steps below. Fill in the tables when run.

## Restore drill (target: < 60 min on a fresh VPS)

| Item | Value |
| --- | --- |
| Date / operator | |
| Snapshot id and age | |
| VPS size / region | |

| Step | Minutes | Notes |
| --- | --- | --- |
| 1 Prepare server and `.env` | | |
| 2 Fetch backup | | |
| 3 Restore database | | |
| 4 Restore uploads | | |
| 5 Start and verify | | |
| **Total** | | pass if < 60 |

Verification: admin login ☐ latest lead present ☐ latest article present ☐ uploaded image loads ☐ outbox has no new failures ☐ nightly backup resumed ☐

Runbook corrections made: 

## Alert drill (target: alert received < 5 min)
Stopped `api` at ____, email received ____, SMS/WhatsApp received ____, restarted ____.

## Rollback drill (T011a, target: < 15 min)
1. Merge a deliberately broken build to staging (e.g. web returning 500 on `/api/health`): the deploy workflow's health gate
   must fail and the automatic rollback step must restore the previous tag. Record both.
2. Manual rollback: Actions → "Deploy to VPS" → Run workflow → environment `staging`, `rollback_tag` = a known good SHA.

| Check | Result |
| --- | --- |
| Time from broken deploy start to previous tag healthy | |
| Automatic rollback restored previous tag | |
| Manual rollback by SHA tag worked | |
