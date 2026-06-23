import { pool } from './db'

const exercises = [
  // Chest (Push)
  { name: 'Flat Barbell Bench Press', category: 'chest', description: 'Barbell chest press on a flat bench' },
  { name: 'Incline Dumbbell Bench Press', category: 'chest', description: 'Dumbbell chest press on an incline bench' },
  { name: 'Decline Barbell Bench Press', category: 'chest', description: 'Barbell chest press on a decline bench' },
  { name: 'Decline Dumbbell Bench Press', category: 'chest', description: 'Dumbbell chest press on a decline bench' },
  { name: 'Chest Dips', category: 'chest', description: 'Bodyweight chest-focused dip exercise' },
  { name: 'Dumbbell Chest Fly', category: 'chest', description: 'Flat bench dumbbell chest flyes' },
  { name: 'Incline Dumbbell Fly', category: 'chest', description: 'Incline bench dumbbell chest flyes' },
  { name: 'Decline Dumbbell Fly', category: 'chest', description: 'Decline bench dumbbell chest flyes' },
  { name: 'Cable Fly', category: 'chest', description: 'Cable machine chest crossover flyes' },
  { name: 'Push-ups', category: 'chest', description: 'Bodyweight chest press' },
  { name: 'Decline Push-ups', category: 'chest', description: 'Bodyweight chest press with feet elevated' },
  { name: 'Incline Push-ups', category: 'chest', description: 'Bodyweight chest press with hands elevated' },
  { name: 'Incline Barbell Bench Press', category: 'chest', description: 'Barbell chest press on an incline bench' },
  { name: 'Dumbbell Pullover', category: 'chest', description: 'Lying dumbbell pullover for upper chest and serratus' },
  { name: 'Chest Press', category: 'chest', description: 'Machine chest press' },
  { name: 'Chest Fly Machine', category: 'chest', description: 'Machine chest fly' },
  { name: 'Pec Deck Fly', category: 'chest', description: 'Machine pec deck fly' },
  { name: 'Dumbbell Floor Press', category: 'chest', description: 'Chest press lying on the floor with dumbbells' },
  { name: 'Landmine Press', category: 'chest', description: 'Standing single arm landmine press' },

  // Back (Pull)
  { name: 'Conventional Deadlift', category: 'back', description: 'Barbell deadlift from the floor' },
  { name: 'Sumo Deadlift', category: 'back', description: 'Wide stance deadlift targeting lower back and hips' },
  { name: 'Deficit Deadlift', category: 'back', description: 'Barbell deadlift standing on an elevated platform' },
  { name: 'Rack Pulls', category: 'back', description: 'Partial-range deadlift from knee height in a power rack' },
  { name: 'Pull-ups', category: 'back', description: 'Wide grip bodyweight pull-ups' },
  { name: 'Chin-ups', category: 'back', description: 'Underhand grip pull-ups focusing on lats and biceps' },
  { name: 'Barbell Bent Over Rows', category: 'back', description: 'Heavy barbell bent-over row' },
  { name: 'One-Arm Dumbbell Rows', category: 'back', description: 'Single arm rows using a bench' },
  { name: 'Lat Pulldown', category: 'back', description: 'Machine wide-grip lat pulldowns' },
  { name: 'Lat Pulldown (Close Grip)', category: 'back', description: 'Close-grip attachment lat pulldown' },
  { name: 'Lat Pulldown (Neutral Grip)', category: 'back', description: 'Neutral-grip attachment lat pulldown' },
  { name: 'Seated Cable Row', category: 'back', description: 'Seated close-grip cable rows' },
  { name: 'T-Bar Row', category: 'back', description: 'Plate-loaded T-bar row' },
  { name: 'Face Pulls', category: 'back', description: 'Cable machine face pulls for rear delts and upper back' },
  { name: 'Straight-Arm Cable Pulldown', category: 'back', description: 'Standing straight-arm cable lat pulldowns' },
  { name: 'Chest-Supported Dumbbell Rows', category: 'back', description: 'Dumbbell rows lying prone on an incline bench' },
  { name: 'Inverted Rows', category: 'back', description: 'Bodyweight pull row using a low barbell' },
  { name: 'Back Extensions (Hyperextension)', category: 'back', description: 'Lower back extension on a Roman chair' },
  { name: 'Good Mornings', category: 'back', description: 'Barbell hip hinge targeting the lower back and hamstrings' },

  // Legs (Legs)
  { name: 'Barbell Back Squats', category: 'legs', description: 'Heavy barbell squat for quads and glutes' },
  { name: 'Barbell Front Squats', category: 'legs', description: 'Quad-dominant barbell front squat' },
  { name: 'Leg Press', category: 'legs', description: 'Machine leg press' },
  { name: 'Romanian Deadlifts (RDL)', category: 'legs', description: 'Barbell Romanian deadlift for hamstrings and glutes' },
  { name: 'Bulgarian Split Squats', category: 'legs', description: 'Dumbbell single leg split squat' },
  { name: 'Leg Extensions', category: 'legs', description: 'Machine quad extensions' },
  { name: 'Lying Leg Curls', category: 'legs', description: 'Machine hamstring curls' },
  { name: 'Seated Leg Curls', category: 'legs', description: 'Seated hamstring leg curl machine' },
  { name: 'Standing Calf Raises', category: 'legs', description: 'Calf extension on standing machine' },
  { name: 'Seated Calf Raises', category: 'legs', description: 'Seated plate-loaded calf raise' },
  { name: 'Hip Thrusts', category: 'legs', description: 'Barbell glute hip thrust' },
  { name: 'Walking Lunges', category: 'legs', description: 'Dumbbell walking lunges' },
  { name: 'Goblet Squats', category: 'legs', description: 'Kettlebell or dumbbell front squat' },
  { name: 'Goblet Squats (Heels Elevated)', category: 'legs', description: 'Dumbbell goblet squat with heels elevated' },
  { name: 'Hack Squat Machine', category: 'legs', description: 'Machine hack squat for quads and glutes' },
  { name: 'Sumo Squats', category: 'legs', description: 'Wide stance squat targeting adductors and glutes' },
  { name: 'Hip Abductor Machine', category: 'legs', description: 'Outer thigh abductor machine' },
  { name: 'Hip Adductor Machine', category: 'legs', description: 'Inner thigh adductor machine' },
  { name: 'Glute Kickbacks (Cable)', category: 'legs', description: 'Cable machine glute kickback' },
  { name: 'Pistol Squats', category: 'legs', description: 'Single-leg bodyweight squat' },
  { name: 'Air Squats', category: 'legs', description: 'Bodyweight squats' },
  { name: 'Step-ups', category: 'legs', description: 'Dumbbell step-ups onto a box' },

  // Shoulders (Push)
  { name: 'Barbell Overhead Press', category: 'shoulders', description: 'Standing military press for front delts' },
  { name: 'Dumbbell Shoulder Press', category: 'shoulders', description: 'Seated dumbbell overhead press' },
  { name: 'Dumbbell Lateral Raises', category: 'shoulders', description: 'Standing lateral raise for side delts' },
  { name: 'Dumbbell Front Raises', category: 'shoulders', description: 'Front raise for front delts' },
  { name: 'Reverse Delt Fly', category: 'shoulders', description: 'Machine or dumbbell flyes for rear delts' },
  { name: 'Barbell Shrugs', category: 'shoulders', description: 'Heavy shrugs for upper traps' },
  { name: 'Dumbbell Shrugs', category: 'shoulders', description: 'Dumbbell shrugs targeting the upper traps' },
  { name: 'Upright Rows', category: 'shoulders', description: 'Barbell or cable upright rows' },
  { name: 'Arnold Press', category: 'shoulders', description: 'Seated shoulder press with rotating palms' },
  { name: 'Push Press', category: 'shoulders', description: 'Overhead press using leg drive' },
  { name: 'Behind the Neck Press', category: 'shoulders', description: 'Overhead press starting from the back of the neck' },
  { name: 'Cable Lateral Raises', category: 'shoulders', description: 'Side deltoid raise using a low cable' },
  { name: 'Incline Rear Delt Fly', category: 'shoulders', description: 'Rear deltoid dumbbell flyes lying on an incline bench' },
  { name: 'Lu Raises', category: 'shoulders', description: 'Full range lateral raises ending overhead' },

  // Arms (Push/Pull)
  { name: 'Barbell Bicep Curls', category: 'arms', description: 'Standing barbell curls' },
  { name: 'EZ-Bar Bicep Curls', category: 'arms', description: 'Bicep curls using an EZ-curl bar' },
  { name: 'Cable Bicep Curls', category: 'arms', description: 'Bicep curls using a cable machine' },
  { name: 'Incline Dumbbell Curls', category: 'arms', description: 'Bicep curls on incline bench' },
  { name: 'Hammer Curls', category: 'arms', description: 'Dumbbell curls with neutral grip' },
  { name: 'Preacher Curls', category: 'arms', description: 'EZ-bar curls on a preacher bench' },
  { name: 'Spider Curls', category: 'arms', description: 'Bicep curls lying chest-down on an incline bench' },
  { name: 'Zottman Curls', category: 'arms', description: 'Bicep curls with forearm rotation' },
  { name: 'Concentration Curls', category: 'arms', description: 'Seated single arm dumbbell curl' },
  { name: 'Tricep Rope Pushdowns', category: 'arms', description: 'Cable tricep press down' },
  { name: 'Skull Crushers', category: 'arms', description: 'Lying EZ-bar tricep extensions' },
  { name: 'Overhead Dumbbell Tricep Extension', category: 'arms', description: 'Seated overhead dumbbell extension' },
  { name: 'Close-Grip Bench Press', category: 'arms', description: 'Barbell chest press with narrow grip' },
  { name: 'Tricep Bench Dips', category: 'arms', description: 'Bodyweight tricep dips supported by a bench' },
  { name: 'Tricep Kickbacks', category: 'arms', description: 'Dumbbell tricep kickbacks' },
  { name: 'Single-Arm Cable Pushdowns', category: 'arms', description: 'Tricep pressdown with single cable handle' },
  { name: 'Reverse Grip Pressdowns', category: 'arms', description: 'Tricep pressdowns with underhand grip' },
  { name: 'Barbell Wrist Curls', category: 'arms', description: 'Forearm wrist curls using a barbell' },
  { name: 'Reverse Barbell Curls', category: 'arms', description: 'Curls with overhand grip targeting the brachioradialis' },

  // Core
  { name: 'Planks', category: 'core', description: 'Core stabilization isometric hold' },
  { name: 'Ab Wheel Rollouts', category: 'core', description: 'Core rollout with ab wheel' },
  { name: 'Hanging Leg Raises', category: 'core', description: 'Hanging leg raises from pull-up bar' },
  { name: 'Hanging Knee Raises', category: 'core', description: 'Hanging core raise with bent knees' },
  { name: 'Decline Bench Crunches', category: 'core', description: 'Crunches on a decline bench' },
  { name: 'Weighted Crunches', category: 'core', description: 'Crunches holding a plate or dumbbell' },
  { name: 'Russian Twists', category: 'core', description: 'Seated rotational core exercise' },
  { name: 'Cable Crunches', category: 'core', description: 'Kneeling cable crunches' },
  { name: 'Cable Woodchoppers', category: 'core', description: 'Rotational core cable woodchopper' },
  { name: 'Dead Bug', category: 'core', description: 'Core stabilization exercise lying on the back' },
  { name: 'Bird Dog', category: 'core', description: 'Plank-like extension of alternate arms and legs' },
  { name: 'Side Planks', category: 'core', description: 'Lateral core stabilization hold' },
  { name: 'Bicycle Crunches', category: 'core', description: 'Alternating rotational crunches' },
  { name: 'L-Sit', category: 'core', description: 'Static holds supporting bodyweight with legs parallel to floor' },
  { name: 'Toes to Bar', category: 'core', description: 'Hanging core exercise raising toes to the bar' },
  { name: 'Lateral Raises', category: 'shoulders', description: 'Standing lateral raise targeting side deltoids' },
  { name: 'Tricep Dips', category: 'arms', description: 'Bodyweight or weighted dips focusing on triceps' }
]

const templates = [
  {
    name: 'Upper Day',
    description: 'Rutinitas fokus tubuh bagian atas (dada, punggung, bahu, dan lengan).',
    exercises: [
      { name: 'Chest Press', sets: 3, reps: 10, weight: '45.00' },
      { name: 'Chest Fly Machine', sets: 3, reps: 12, weight: '35.00' },
      { name: 'Lat Pulldown', sets: 3, reps: 10, weight: '50.00' },
      { name: 'Seated Cable Row', sets: 3, reps: 10, weight: '45.00' },
      { name: 'Lateral Raises', sets: 3, reps: 12, weight: '10.00' },
      { name: 'Tricep Dips', sets: 3, reps: 12, weight: '0.00' }
    ]
  },
  {
    name: 'Push Day',
    description: 'Rutinitas latihan fokus otot dorong (dada, bahu, dan tricep).',
    exercises: [
      { name: 'Chest Press', sets: 4, reps: 8, weight: '45.00' },
      { name: 'Dumbbell Shoulder Press', sets: 3, reps: 10, weight: '18.00' },
      { name: 'Chest Fly Machine', sets: 3, reps: 12, weight: '40.00' },
      { name: 'Dumbbell Lateral Raises', sets: 3, reps: 12, weight: '10.00' },
      { name: 'Tricep Rope Pushdowns', sets: 3, reps: 12, weight: '20.00' }
    ]
  },
  {
    name: 'Pull Day',
    description: 'Rutinitas latihan fokus otot tarik menggunakan alat/mesin (punggung, rear delts, dan bicep).',
    exercises: [
      { name: 'Lat Pulldown', sets: 3, reps: 10, weight: '50.00' },
      { name: 'Seated Cable Row', sets: 3, reps: 10, weight: '45.00' },
      { name: 'T-Bar Row', sets: 3, reps: 10, weight: '40.00' },
      { name: 'Face Pulls', sets: 3, reps: 12, weight: '20.00' },
      { name: 'Straight-Arm Cable Pulldown', sets: 3, reps: 12, weight: '25.00' },
      { name: 'Cable Bicep Curls', sets: 3, reps: 12, weight: '15.00' }
    ]
  },
  {
    name: 'Leg Day',
    description: 'Rutinitas latihan fokus tubuh bagian bawah (quads, hamstrings, glutes, dan calves).',
    exercises: [
      { name: 'Barbell Back Squats', sets: 4, reps: 8, weight: '80.00' },
      { name: 'Romanian Deadlifts (RDL)', sets: 3, reps: 10, weight: '60.00' },
      { name: 'Leg Press', sets: 3, reps: 10, weight: '120.00' },
      { name: 'Leg Extensions', sets: 3, reps: 12, weight: '40.00' },
      { name: 'Lying Leg Curls', sets: 3, reps: 12, weight: '30.00' },
      { name: 'Standing Calf Raises', sets: 4, reps: 15, weight: '50.00' }
    ]
  }
]

export async function seedExercises() {
  try {
    console.log('Seeding exercises...')
    let insertedCount = 0

    for (const ex of exercises) {
      // Check if this exercise already exists by name
      const checkResult = await pool.query(
        'SELECT id FROM "exercise" WHERE name = $1',
        [ex.name]
      )

      if (checkResult.rows.length === 0) {
        await pool.query(
          'INSERT INTO "exercise" (name, category, description) VALUES ($1, $2, $3)',
          [ex.name, ex.category, ex.description]
        )
        insertedCount++
      }
    }

    console.log(`Seeding completed: Added ${insertedCount} new exercises.`)
  } catch (error) {
    console.error('Seed error:', error)
    throw error
  }
}

export async function seedTemplates() {
  try {
    console.log('Running database migrations (adding username, ispublic, & routineShare)...')
    await pool.query('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS username text UNIQUE')
    await pool.query('ALTER TABLE "routine" ADD COLUMN IF NOT EXISTS ispublic boolean NOT NULL DEFAULT false')
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "routineShare" (
        id serial primary key,
        routineid integer not null,
        senderid text not null,
        receiverid text not null,
        status text not null default 'pending',
        createdat timestamp not null default now()
      )
    `)

    console.log('Seeding template routines...')
    
    // 0. Ensure system user exists to satisfy foreign key constraints
    const systemUserQuery = await pool.query(
      'SELECT id FROM "user" WHERE id = $1',
      ['system']
    )
    if (systemUserQuery.rows.length === 0) {
      await pool.query(
        'INSERT INTO "user" (id, name, email) VALUES ($1, $2, $3)',
        ['system', 'System Templates', 'system@gymbro.ai']
      )
    }

    // 1. Get all system routine IDs to clean up
    const systemRoutinesQuery = await pool.query(
      'SELECT id FROM "routine" WHERE userid = $1',
      ['system']
    )
    const systemRoutineIds = systemRoutinesQuery.rows.map(r => r.id)
    
    if (systemRoutineIds.length > 0) {
      // Clean up routineExercise first
      await pool.query(
        'DELETE FROM "routineExercise" WHERE routineid = ANY($1)',
        [systemRoutineIds]
      )
      // Clean up routine
      await pool.query(
        'DELETE FROM "routine" WHERE userid = $1',
        ['system']
      )
    }

    // 2. Insert new templates
    for (const t of templates) {
      const routineInsert = await pool.query(
        'INSERT INTO "routine" (userid, name, description, isactive) VALUES ($1, $2, $3, $4) RETURNING id',
        ['system', t.name, t.description, true]
      )
      const routineId = routineInsert.rows[0].id
      
      let orderIndex = 0
      for (const ex of t.exercises) {
        // Find exercise ID by name
        const exQuery = await pool.query(
          'SELECT id FROM "exercise" WHERE name = $1',
          [ex.name]
        )
        
        if (exQuery.rows.length > 0) {
          const exerciseId = exQuery.rows[0].id
          await pool.query(
            'INSERT INTO "routineExercise" (routineid, exerciseid, sets, reps, weight, orderindex) VALUES ($1, $2, $3, $4, $5, $6)',
            [routineId, exerciseId, ex.sets, ex.reps, ex.weight, orderIndex++]
          )
        } else {
          console.warn(`Exercise not found when seeding template: ${ex.name}`)
        }
      }
    }
    console.log('Template routines seeding completed.')
  } catch (error) {
    console.error('Error seeding template routines:', error)
    throw error
  }
}
