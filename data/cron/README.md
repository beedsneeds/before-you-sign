How to run the cron job:

#1 (Optional, but necessary for generating notifications) Backfill violation history from a release
Download, unzip and rename any [release](https://github.com/beedsneeds/before-you-sign/releases) to `violations.csv` and place it in `data/cron/`. Then run: `npx tsx data/cron/ingestViolations.ts`

This ingests the existing CSV into the db without fetching from the API and without notifying any subscribers (so users don't get spammed on historical entries)

#2 Start the cron
Run `npx tsx data/cron/cron.ts`. It will fetch from the API, ingest, and notify subscribers of any new violations on each tick (every 5 min)
If you ran the optional step above, the db should be populated with 100_000's of violations immediately. If not, it will be populated with ~50k violations after 60s (with no notifications delivered)

Troubleshoot:
If anything breaks, try `npx tsx data/cron/fetchViolations.ts` and then `npx tsx data/cron/ingestViolations.ts`. Tell me what went wrong

I also included a json so you understand what is being fetching from the API

---

Will clean up later:

Should the API fetch all data even though I only have MH on the releases

Class A (non-hazardous), Class B (hazardous), Class C (immediately hazardous) and Class I (information orders)

Current status date is what I'll use for updates

As of 5/1, there's 10,902485 rows
Narrowing data:

- 5,001949 rows since 2020 May
- 2,089133 rows of only Manhattan
- 4,118037 rows of only Brooklyn

885777 rows

The row names differ from the api (that retrieves a json) and a csv export
