import { pgTable, text, timestamp, boolean, serial, integer, decimal } from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailverified').notNull().default(false),
  image: text('image'),
  username: text('username').unique(),
  createdAt: timestamp('createdat').notNull().defaultNow(),
  updatedAt: timestamp('updatedat').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresat').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdat').notNull().defaultNow(),
  updatedAt: timestamp('updatedat').notNull().defaultNow(),
  ipAddress: text('ipaddress'),
  userAgent: text('useragent'),
  userId: text('userid')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountid').notNull(),
  providerId: text('providerid').notNull(),
  userId: text('userid')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accesstoken'),
  refreshToken: text('refreshtoken'),
  idToken: text('idtoken'),
  accessTokenExpiresAt: timestamp('accesstokenexpiresat'),
  refreshTokenExpiresAt: timestamp('refreshtokenexpiresat'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdat').notNull().defaultNow(),
  updatedAt: timestamp('updatedat').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresat').notNull(),
  createdAt: timestamp('createdat').defaultNow(),
  updatedAt: timestamp('updatedat').defaultNow(),
})

// --- App tables ------------------------------------------------------------
// Add your app tables below. Always include a plain `userId` column so queries
// can be scoped per user — the security model depends on this column existing,
// not on a foreign key. Do NOT add a foreign key constraint
// (`.references(() => user.id, ...)`) unless the user explicitly asks for
// foreign keys or referential integrity; FK constraints make iterating on the
// schema harder.
//
// Example:
//
// import { serial } from "drizzle-orm/pg-core"
//
// export const todos = pgTable("todos", {
//   id: serial("id").primaryKey(),
//   userId: text("userId").notNull(),
//   title: text("title").notNull(),
//   completed: boolean("completed").notNull().default(false),
//   createdAt: timestamp("createdAt").notNull().defaultNow(),
// })
//
// If the user asks for foreign keys, add the reference back in:
//   userId: text("userId")
//     .notNull()
//     .references(() => user.id, { onDelete: "cascade" }),

// GymTrack Tables
export const exercise = pgTable('exercise', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(), // 'chest', 'back', 'legs', 'shoulders', 'arms', 'core'
  imageUrl: text('imageurl'),
  createdAt: timestamp('createdat').notNull().defaultNow(),
})

export const routine = pgTable('routine', {
  id: serial('id').primaryKey(),
  userId: text('userid').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  isActive: boolean('isactive').notNull().default(true),
  isPublic: boolean('ispublic').notNull().default(false),
  createdAt: timestamp('createdat').notNull().defaultNow(),
  updatedAt: timestamp('updatedat').notNull().defaultNow(),
})

export const routineExercise = pgTable('routineExercise', {
  id: serial('id').primaryKey(),
  routineId: integer('routineid').notNull(),
  exerciseId: integer('exerciseid').notNull(),
  sets: integer('sets').notNull().default(3),
  reps: integer('reps'),
  weight: decimal('weight', { precision: 10, scale: 2 }),
  duration: integer('duration'), // in seconds
  rest: integer('rest'), // in seconds
  orderIndex: integer('orderindex').notNull(),
  createdAt: timestamp('createdat').notNull().defaultNow(),
})

export const workout = pgTable('workout', {
  id: serial('id').primaryKey(),
  userId: text('userid').notNull(),
  routineId: integer('routineid'),
  name: text('name'),
  startedAt: timestamp('startedat').notNull(),
  completedAt: timestamp('completedat'),
  duration: integer('duration'), // in minutes
  notes: text('notes'),
  createdAt: timestamp('createdat').notNull().defaultNow(),
})

export const workoutSet = pgTable('workoutSet', {
  id: serial('id').primaryKey(),
  workoutId: integer('workoutid').notNull(),
  exerciseId: integer('exerciseid').notNull(),
  setNumber: integer('setnumber').notNull(),
  reps: integer('reps'),
  weight: decimal('weight', { precision: 10, scale: 2 }),
  duration: integer('duration'), // in seconds
  notes: text('notes'),
  createdAt: timestamp('createdat').notNull().defaultNow(),
})

export const progress = pgTable('progress', {
  id: serial('id').primaryKey(),
  userId: text('userid').notNull(),
  exerciseId: integer('exerciseid').notNull(),
  weight: decimal('weight', { precision: 10, scale: 2 }),
  reps: integer('reps'),
  maxWeight: decimal('maxweight', { precision: 10, scale: 2 }),
  totalVolume: decimal('totalvolume', { precision: 10, scale: 2 }),
  recordedAt: timestamp('recordedat').notNull().defaultNow(),
})

export const routineShare = pgTable('routineShare', {
  id: serial('id').primaryKey(),
  routineId: integer('routineid').notNull(),
  senderId: text('senderid').notNull(),
  receiverId: text('receiverid').notNull(),
  status: text('status').notNull().default('pending'), // 'pending', 'accepted', 'declined'
  createdAt: timestamp('createdat').notNull().defaultNow(),
})
