export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core'

export function muscleGroupForName(name: string): MuscleGroup | null {
  const value = name.toLowerCase()
  if (/pectoralis/.test(value)) return 'chest'
  if (/deltoid|infraspinatus|supraspinatus|teres minor|subscapularis/.test(value)) return 'shoulders'
  if (/trapezius|latissimus|rhomboid|erector|thoracolumbar|teres major|levator scapulae/.test(value)) return 'back'
  if (/abdominis|oblique|serratus anterior|linea alba/.test(value)) return 'core'
  if (/femoris|vastus|gluteus|gastrocnemius|soleus|tibialis|fibularis|sartorius|gracilis|semitendinosus|semimembranosus|adductor|pectineus|tensor fasciae|iliotibial|calcaneal/.test(value)) return 'legs'
  if (/brachii|brachialis|brachioradialis|anconeus|carpi|pronator|supinator|palmaris|digitorum superficialis/.test(value)) return 'arms'
  return null
}
