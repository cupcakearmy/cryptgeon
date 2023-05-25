export function getStdin(timeout: number = 10): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    // Store the data from stdin in a buffer
    let buffer = ''
    let t: NodeJS.Timeout

    const dataHandler = (d: Buffer) => (buffer += d.toString())
    const endHandler = () => {
      clearTimeout(t)
      resolve(buffer.trim())
    }

    // Stop listening for data after the timeout, otherwise hangs indefinitely
    t = setTimeout(() => {
      process.stdin.removeListener('data', dataHandler)
      process.stdin.removeListener('end', endHandler)
      process.stdin.pause()
      resolve('')
    }, timeout)

    process.stdin.on('data', dataHandler)
    process.stdin.on('end', endHandler)
  })
}
