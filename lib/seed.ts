import { pool } from './db'

const exercises = [
  // Chest (Push)
  { name: 'Flat Barbell Bench Press', category: 'chest', description: 'Barbell chest press on a flat bench' },
  { name: 'Incline Dumbbell Bench Press', category: 'chest', description: 'Dumbbell chest press on an incline bench' },
  { name: 'Decline Barbell Bench Press', category: 'chest', description: 'Barbell chest press on a decline bench' },
  { name: 'Chest Dips', category: 'chest', description: 'Bodyweight chest-focused dip exercise' },
  { name: 'Dumbbell Chest Fly', category: 'chest', description: 'Flat bench dumbbell chest flyes' },
  { name: 'Cable Fly', category: 'chest', description: 'Cable machine chest crossover flyes' },
  { name: 'Push-ups', category: 'chest', description: 'Bodyweight chest press' },
  { name: 'Incline Barbell Bench Press', category: 'chest', description: 'Barbell chest press on an incline bench' },
  { name: 'Dumbbell Pullover', category: 'chest', description: 'Lying dumbbell pullover for upper chest and serratus' },
  { name: 'Chest Press', category: 'chest', description: 'Machine chest press' },
  { name: 'Chest Fly Machine', category: 'chest', description: 'Machine chest fly' },

  // Back (Pull)
  { name: 'Conventional Deadlift', category: 'back', description: 'Barbell deadlift from the floor' },
  { name: 'Sumo Deadlift', category: 'back', description: 'Wide stance deadlift targeting lower back and hips' },
  { name: 'Pull-ups', category: 'back', description: 'Wide grip bodyweight pull-ups' },
  { name: 'Chin-ups', category: 'back', description: 'Underhand grip pull-ups focusing on lats and biceps' },
  { name: 'Barbell Bent Over Rows', category: 'back', description: 'Heavy barbell bent-over row' },
  { name: 'One-Arm Dumbbell Rows', category: 'back', description: 'Single arm rows using a bench' },
  { name: 'Lat Pulldown', category: 'back', description: 'Machine wide-grip lat pulldowns' },
  { name: 'Seated Cable Row', category: 'back', description: 'Seated close-grip cable rows' },
  { name: 'T-Bar Row', category: 'back', description: 'Plate-loaded T-bar row' },
  { name: 'Face Pulls', category: 'back', description: 'Cable machine face pulls for rear delts and upper back' },

  // Legs (Legs)
  { name: 'Barbell Back Squats', category: 'legs', description: 'Heavy barbell squat for quads and glutes' },
  { name: 'Barbell Front Squats', category: 'legs', description: 'Quad-dominant barbell front squat' },
  { name: 'Leg Press', category: 'legs', description: 'Machine leg press' },
  { name: 'Romanian Deadlifts (RDL)', category: 'legs', description: 'Barbell Romanian deadlift for hamstrings and glutes' },
  { name: 'Bulgarian Split Squats', category: 'legs', description: 'Dumbbell single leg split squat' },
  { name: 'Leg Extensions', category: 'legs', description: 'Machine quad extensions' },
  { name: 'Lying Leg Curls', category: 'legs', description: 'Machine hamstring curls' },
  { name: 'Standing Calf Raises', category: 'legs', description: 'Calf extension on standing machine' },
  { name: 'Seated Calf Raises', category: 'legs', description: 'Seated plate-loaded calf raise' },
  { name: 'Hip Thrusts', category: 'legs', description: 'Barbell glute hip thrust' },
  { name: 'Walking Lunges', category: 'legs', description: 'Dumbbell walking lunges' },
  { name: 'Goblet Squats', category: 'legs', description: 'Kettlebell or dumbbell front squat' },

  // Shoulders (Push)
  { name: 'Barbell Overhead Press', category: 'shoulders', description: 'Standing military press for front delts' },
  { name: 'Dumbbell Shoulder Press', category: 'shoulders', description: 'Seated dumbbell overhead press' },
  { name: 'Dumbbell Lateral Raises', category: 'shoulders', description: 'Standing lateral raise for side delts' },
  { name: 'Dumbbell Front Raises', category: 'shoulders', description: 'Front raise for front delts' },
  { name: 'Reverse Delt Fly', category: 'shoulders', description: 'Machine or dumbbell flyes for rear delts' },
  { name: 'Barbell Shrugs', category: 'shoulders', description: 'Heavy shrugs for upper traps' },
  { name: 'Upright Rows', category: 'shoulders', description: 'Barbell or cable upright rows' },

  // Arms (Push/Pull)
  { name: 'Barbell Bicep Curls', category: 'arms', description: 'Standing barbell curls' },
  { name: 'Incline Dumbbell Curls', category: 'arms', description: 'Bicep curls on incline bench' },
  { name: 'Hammer Curls', category: 'arms', description: 'Dumbbell curls with neutral grip' },
  { name: 'Preacher Curls', category: 'arms', description: 'EZ-bar curls on a preacher bench' },
  { name: 'Tricep Rope Pushdowns', category: 'arms', description: 'Cable tricep press down' },
  { name: 'Skull Crushers', category: 'arms', description: 'Lying EZ-bar tricep extensions' },
  { name: 'Overhead Dumbbell Tricep Extension', category: 'arms', description: 'Seated overhead dumbbell extension' },
  { name: 'Close-Grip Bench Press', category: 'arms', description: 'Barbell chest press with narrow grip' },
  { name: 'Concentration Curls', category: 'arms', description: 'Seated single arm dumbbell curl' },

  // Core
  { name: 'Planks', category: 'core', description: 'Core stabilization isometric hold' },
  { name: 'Ab Wheel Rollouts', category: 'core', description: 'Core rollout with ab wheel' },
  { name: 'Hanging Leg Raises', category: 'core', description: 'Hanging leg raises from pull-up bar' },
  { name: 'Russian Twists', category: 'core', description: 'Seated rotational core exercise' },
  { name: 'Cable Crunches', category: 'core', description: 'Kneeling cable crunches' }
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
