# Before You Sign

## Setup

- [ ] Backfill violation history from a [release](https://github.com/beedsneeds/before-you-sign/releases). This is optional, but necessary for generating notifications
  - [ ] Download, unzip and rename any release to `violations.csv` and place it in `data/cron/`. We recommend using `NYC.2025-5-1.to.2026-5-1.zip` since it only has ~150k rows

- [ ] Run `npm install` to initialize deps

- [ ] Run `sudo systemctl start mongod` & `npm run seeddb` to launch and seed mongoDb
  - This may take a while, and the logs will be noisy. Once its done, it also logs a list of buildings that will emit notifications during the next automated HPD dataset fetch.

## Start the server

- [ ] Once our db is seeded, run `npm run dev`
  - seeddb provides 2 admin users and 1 basic users: "sudo@gmail.com", "mayor@zohranfornyc.com" & "normal@gmail.com" repectively. Their passwords can be found in the seed.ts file

### Testing Email Notifications:

- [ ] Place a Resend API (see .env.example) in your .env

- [ ] Create an account on BeforeYouSign with the same email. Notifications will not be sent to any email not tied to the API key.

- [ ] Go into your edit profile page and select the appropriate notification preference

- [ ] Run `npx tsx data/cron/cron.ts`. It will fetch from the HPD dataset, ingest, and notify subscribers of any new violations of a saved Building from the last 7 days, (frequency of fetch: every 5 min, so you can Ctrl+C after the first)

#### After a fetch:

- Run `npm install` to install all deps

#### Before a push:

- Run `npm run format`

## Github Housekeeping:

```bash
git checkout main
git pull
git checkout <branch>
git merge main # or suggest
git push origin <branch>
```

## General

Set-up:

- `sudo systemctl start mongod` (add your mongod cmd if you'd like) and `npm run seeddb`
- Use `npm run dev` to run TS in development

Run `npm start` to run compiled js AFTER `npm run build` compiles all ts to js into /dist

Strong Typechecking tips:

- Never use `any` unless prototyping
- See data/models/README.md

#### Imports

Use the .js extension _only_ for import paths even if the actual file is a .ts
We will not set allowImportingTsExtensions

#### Testing

## Testing Associated Buildings

The Associated Buildings feature REQUIRES the violations dataset and cron ingestion setup.

Before testing this feature, finish Step 1 and 2 in:
`data/cron/README.md`

Then run:

```bash
npx tsx data/cron/cron.ts
```

To test the feature, search for BIN 1005521. Use **Manhattan.2025-5-1.to.2026-5-1.zip** from the releases page.
