# 🗄️ Firestore Schema Definitions

**CRITICAL RULE:** No developer or AI assistant may invent, add, or modify a Firestore collection or field without first updating this document and getting it approved.

## `users` (Collection)
* `uid` (String, Document ID): Firebase Auth UID.
* `role` (String): e.g., "customer", "admin", "staff".
* `createdAt` (Timestamp)

## `products` (Collection)
* `id` (String, Document ID)
* `vertical` (String): "pawn", "cannabis", or "fireworks".
* `name` (String)
* `price` (Number)
* `inStock` (Boolean)
* `metadata` (Map): Vertical-specific details.

## `audit_logs` (Collection)
*(Used for compliance tracking)*
* `id` (String, Document ID)
* `action` (String)
* `performedBy` (String): User UID.
* `timestamp` (Timestamp)
* `details` (Map): Action specifics. No PII allowed here unless encrypted.
