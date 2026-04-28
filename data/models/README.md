# How to use these models:

Each model file exports the same set of names with an `X` prefix ( `UserInputSchema`, `UserStoredSchema`, `UserModel`, `User`, `UserDoc`)

## XInputSchema.safeParse()

Use to validate request bodies (signup, login)
This contains only those fields that the client can send, if there's any fields that's missing/should be here, let me know

```ts
// I prefer:
const parsed = UserInputSchema.safeParse(req.body);
// parsed: { success: true; data: User } | { success: false; error: z.ZodError }
if (!parsed.success) {
  // https://zod.dev/error-formatting?id=zflattenerror
  // Don't have to rewrite code for error messages
}
// Here, parsed.data: User
```

```ts
// code style from class:
try {
  UserInputSchema.parse(req.body);
} catch (error) {
  if (error instanceof z.ZodError) {
    // throw error
  }
}
```

## XModel.mongoMethods()

Use for all db operations (.find, .create...). It uses `User` as the [interface](https://mongoosejs.com/docs/typescript.html#using-generics)

It returns **UserDoc**, which is a document interface. It's similar to `User`, but it has all the fields/methods you might use like `userDoc.save()`

```ts
// Create from parsed data (after .safeParse())
const user = await UserModel.create({ ...parsed.data, hashedPassword });
// Here, user: UserDoc   (or HydratedDocument<User>)
```

```ts
// Create internally
const user = new UserModel({ firstName: 'Bill', lastName: 'Smith', email: '...', hashedPassword });
// Here, user: UserDoc
await user.save();
```

```ts
// Read data
const user = await UserModel.findOne({ email: 'bill@...' });
// Here, user: UserDoc | null
if (!user) {
  // not found
}
```

## X

Its a plain typescript type.

Use anywhere where you'd need a plain `User` object (like function parameter or return value) `const user: User = parsed.data`

Note: if its returned from the db, use `UserDoc`

```ts
// User
function welcomeEmail(user: User): string { ... }

// UserDoc
async function demote(user: UserDoc) { user.isAdmin = false; await user.save(); }

```

## XStoredSchema.safeParse()

To validate a doc read from the DB (don't usually need this, its main use is to be the source of truth for the `User` type)

# Why do we need so many interfaces?

Because input shape is not the same as what's stored in the db and some fields are transformed before storing (password to hashedPassword)
