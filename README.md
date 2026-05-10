# Before You Sign

### steps to run Before You Sign
- [ ] run `npm run seeddb` to seed databases. This may take a while before you are prompted to continue/terminate.
- [ ] once database seeded, run `npm run dev`
- [ ] seeddb provides an admin user and 2 basic users: "sudo@gmail.com", "normal@gmail.com" & "zohran@nyc.com" repectively. Their passwords can be found in the seed.ts file. You can of course also create your own users.

### important notes
- notifications, while functional, can only work for the current logged in user (shortcomings of working with free software).
- for notifications to work you must generate the api key <>?
- 

#### TODO

- Pairwise evaluation of previous lab specs and relevance in their contribution to the project

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
