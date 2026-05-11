# Before You Sign

## Setup

- [ ] Backfill violation history from a [release](https://github.com/beedsneeds/before-you-sign/releases). This is optional, but necessary for generating notifications.
  - [ ] Download, unzip and rename any release to `violations.csv` and place it in `data/cron/`. We recommend using `NYC.2025-5-1.to.2026-5-1.zip` since it only has ~150k rows.

- [ ] Run `npm install` for deps

- [ ] Run `sudo systemctl start mongod` & `npm run seeddb` to launch and seed mongoDb
  - This may take a while, and the logs will be noisy. Once its done, it also logs a list of buildings that will emit notifications during the next automated HPD dataset fetch.
  - Note: Running the seed will also have the side effect of dropping the database

## Start the server

- [ ] Once our db is seeded, run `npx tsc` and `npm start` or simply `npm run dev`
  - seeddb provides 2 admin users and 1 basic users: "sudo@gmail.com", "mayor@zohranfornyc.com" & "normal@gmail.com" repectively. Their passwords can be found in the seed.ts file. Or you can register your own non-privileged user

### Testing Email Notifications:

- [ ] Place a Resend API (see .env.example) in your .env

- [ ] Create an account on BeforeYouSign with the same email. Email notifications will not be sent to any email not tied to the API key.

- [ ] Go into your edit profile page and select the appropriate notification preference

- [ ] Run `npx tsx data/cron/cron.ts`. It will fetch from the HPD dataset, ingest, and notify subscribers of any new violations of a saved Building from the last 7 days,
  - Frequency of fetch: every 5 min, so you can Ctrl+C after the first. Ideally this would be run every x days not x minutes, but we keep the wait time short to demonstrate correctness
  - Prefer favoriting buildings at the end of the list over those at the start because the row limit is 50k and new data is constantly being added to it (even at 10 minute intervals)

---

### Testing Associated Buildings

The Associated Buildings feature requires the violations dataset and cron ingestion setup to fully populate the database. Once populated with a release dataset, search for BIN 1005521.
