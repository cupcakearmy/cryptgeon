export function getStdin(timeout: number = 10): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    // Store the data from stdin in a buffer
    let buffer = ''
    process.stdin.on('data', (d) => (buffer += d.toString()))

    // Stop listening for data after the timeout, otherwise hangs indefinitely
    const t = setTimeout(() => {
      process.stdin.destroy()
      resolve('')
    }, timeout)

    // Listen for end and error events
    process.stdin.on('end', () => {
      clearTimeout(t)
      resolve(buffer.trim())
    })
    process.stdin.on('error', reject)
  })
}
