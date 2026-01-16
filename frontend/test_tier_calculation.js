// Test tier calculation logic
const calculateTier = (points) => {
  if (points >= 1000) return { tier: 'AI Master', nextTier: null, nextTierPoints: 0, progress: 100 }
  if (points >= 500) return { tier: 'AI Expert', nextTier: 'AI Master', nextTierPoints: 1000, progress: ((points - 500) / 500) * 100 }
  if (points >= 200) return { tier: 'AI Trainer', nextTier: 'AI Expert', nextTierPoints: 500, progress: ((points - 200) / 300) * 100 }
  if (points >= 50) return { tier: 'AI Helper', nextTier: 'AI Trainer', nextTierPoints: 200, progress: ((points - 50) / 150) * 100 }
  if (points >= 10) return { tier: 'AI Learner', nextTier: 'AI Helper', nextTierPoints: 50, progress: ((points - 10) / 40) * 100 }
  return { tier: 'Beginner', nextTier: 'AI Learner', nextTierPoints: 10, progress: (points / 10) * 100 }
}

// Test cases
const testCases = [0, 5, 10, 25, 50, 100, 200, 350, 500, 750, 1000, 1500]

console.log('Tier Calculation Test Results:')
console.log('================================')

testCases.forEach(points => {
  const result = calculateTier(points)
  console.log(`Points: ${points}`)
  console.log(`  Tier: ${result.tier}`)
  console.log(`  Next Tier: ${result.nextTier || 'Max Tier'}`)
  console.log(`  Points to Next: ${result.nextTierPoints}`)
  console.log(`  Progress: ${result.progress.toFixed(1)}%`)
  console.log('---')
})

console.log('\nExpected Results for User with 0 Points:')
console.log('- Tier: Beginner')
console.log('- Next Tier: AI Learner')
console.log('- Points to Next: 10')
console.log('- Progress: 0%')

