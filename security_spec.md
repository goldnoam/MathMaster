# Firestore Security Specification — MathMaster IL

## 1. Data Invariants
1. **Strict Ownership**: Every document under `/users/{userId}` and its subcollections (`private`, `studiedTopics`, `quizzes`, `studyGoals`) is strictly owned by `request.auth.uid == userId`. No cross-user reads or writes are permitted.
2. **Verified Identity**: Write operations require `request.auth != null` and `request.auth.token.email_verified == true`.
3. **PII Isolation**: User email and avatar URL are isolated in `/users/{userId}/private/info`, accessible only by the owner (`get` only, no collection listing).
4. **Master Gate**: Subcollection writes (`studiedTopics`, `quizzes`, `studyGoals`) verify the parent `/users/{userId}` document exists via `exists()` (or `get().data.uid == userId`) to prevent orphaned records.
5. **Strict Key & Boundary Validation**: Every `create` and `update` enforces `keys().hasAll(...)` and `keys().hasOnly(...)`, type validation, explicit `.size()` bounds on every string and array (`studyDays.size() <= 7`), numeric range invariants (`0 <= score <= total`, `0 <= percentage <= 100`), and regex ID validation (`isValidId()`).
6. **Temporal Integrity & Immutability**: `createdAt` must equal `request.time` on `create` and remain immutable on `update`; `updatedAt` must equal `request.time` on `create` and `update`; `uid`/`userId` are immutable.
7. **Immutable Quiz Records**: Completed quiz attempts under `/users/{userId}/quizzes/{quizId}` cannot be forged or modified after creation (`allow update: if false`).

## 2. The "Dirty Dozen" Adversarial Payloads (Must All Fail with `PERMISSION_DENIED`)
1. **Unauthenticated Profile Read**: Unauthenticated client requests `GET /users/userA`.
2. **Cross-User Profile Read**: `userB` requests `GET /users/userA` or `GET /users/userA/private/info`.
3. **Users Collection Scrape**: `userB` executes `LIST /users`.
4. **Unverified Email Spoof**: User with `email_verified: false` attempts `CREATE /users/userB`.
5. **UID Spoofing on Create**: `userB` attempts `CREATE /users/userB` with `{ uid: "userA", ... }`.
6. **Shadow / Ghost Field Injection**: `userB` attempts `CREATE /users/userB` with extra key `isAdmin: true` or `role: "admin"`.
7. **Timestamp Forgery**: `userB` attempts `CREATE /users/userB` with client-provided `createdAt` instead of `request.time`.
8. **Immutable Field Mutation**: `userB` attempts `UPDATE /users/userB` changing `uid` or `createdAt`.
9. **Resource Exhaustion / ID Poisoning**: `userB` attempts `CREATE /users/userB/quizzes/bad$$id` or passes a 5,000-char `displayName`.
10. **Score / Grade Tampering**: `userB` attempts `CREATE /users/userB/quizzes/q1` with `score: 99, total: 5, percentage: 999` or tries `UPDATE /users/userB/quizzes/q1` to raise score.
11. **Unbounded Array Injection**: `userB` attempts `CREATE /users/userB/studyGoals/current` with `studyDays` of length 25 or non-integer values.
12. **Orphaned Subcollection Write**: `userB` attempts `CREATE /users/userB/quizzes/q1` when parent `/users/userB` does not exist.
