// Script to clear localStorage - run this once
if (typeof window !== 'undefined') {
  console.log('=== Clearing localStorage ===')
  localStorage.clear()
  console.log('✓ localStorage cleared!')
  console.log('Reloading page...')
  setTimeout(() => {
    window.location.reload()
  }, 1000)
}
