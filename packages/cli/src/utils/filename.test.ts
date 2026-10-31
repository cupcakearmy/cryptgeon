import { access, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join, sep } from 'node:path'
import { describe, expect, it } from 'vitest'
import { safeDownloadName, saveDownloadedFile } from './filename.js'

const unsafeNames = ['', '.', '..', 'foo/..', 'foo/.', '/', '\\', '..\\', '.\\', 'foo/bar/..']

describe('safeDownloadName', () => {
  it('keeps only a single path segment from a crafted name', () => {
    const cases: Array<[string, string]> = [
      ['../../x', 'x'],
      ['../example.txt', 'example.txt'],
      ['/etc/passwd', 'passwd'],
      ['foo/../../etc/passwd', 'passwd'],
      ['subdir/notes.txt', 'notes.txt'],
      ['....//....//etc/passwd', 'passwd'],
      ['..\\..\\x', 'x'],
      ['C:\\Windows\\evil.txt', 'evil.txt'],
      ['\\\\server\\share\\evil.txt', 'evil.txt'],
      ['foo/bar/../../../x', 'x'],
      ['foo\\bar', 'bar'],
      ['C:evil.txt', 'evil.txt'],
    ]
    for (const [input, expected] of cases) {
      const safe = safeDownloadName(input)
      expect(safe, input).toBe(expected)
      expect(safe.includes('/') || safe.includes('\\'), input).toBe(false)
    }
  })

  it('keeps ordinary names, including dotfiles', () => {
    expect(safeDownloadName('notes.txt')).toBe('notes.txt')
    expect(safeDownloadName('my file.txt')).toBe('my file.txt')
    expect(safeDownloadName('.gitignore')).toBe('.gitignore')
  })

  it.each(unsafeNames)('rejects %j', (name) => {
    expect(() => safeDownloadName(name)).toThrow('Invalid file name')
  })

  it('rejects a non-string name', () => {
    expect(() => safeDownloadName(undefined as unknown as string)).toThrow('Invalid file name')
  })
})

describe('saveDownloadedFile', () => {
  async function workspace() {
    const sandbox = await mkdtemp(join(tmpdir(), 'cryptgeon-dl-'))
    const work = join(sandbox, 'nested', 'work')
    await mkdir(work, { recursive: true })
    return {
      sandbox,
      work,
      cleanup: () => rm(sandbox, { recursive: true, force: true }),
    }
  }

  it('saves a normal file in the target directory', async () => {
    const dir = await workspace()
    try {
      const written = await saveDownloadedFile('notes.txt', Buffer.from('hello'), dir.work)
      expect(written).toBe(join(dir.work, 'notes.txt'))
      expect(await readFile(written, 'utf8')).toBe('hello')
    } finally {
      await dir.cleanup()
    }
  })

  it('writes a traversal name inside the target directory', async () => {
    const dir = await workspace()
    try {
      const written = await saveDownloadedFile('../example.txt', Buffer.from('secret'), dir.work)
      expect(written).toBe(join(dir.work, 'example.txt'))
      expect(await readFile(written, 'utf8')).toBe('secret')
      await expect(access(join(dir.sandbox, 'nested', 'example.txt'))).rejects.toThrow()
    } finally {
      await dir.cleanup()
    }
  })

  it('flattens a nested name instead of creating directories', async () => {
    const dir = await workspace()
    try {
      const written = await saveDownloadedFile('subdir/notes.txt', Buffer.from('body'), dir.work)
      expect(written).toBe(join(dir.work, 'notes.txt'))
      expect(await readFile(written, 'utf8')).toBe('body')
      await expect(access(join(dir.work, 'subdir'))).rejects.toThrow()
    } finally {
      await dir.cleanup()
    }
  })

  it('renames a collision without leaving the target directory', async () => {
    const dir = await workspace()
    try {
      await writeFile(join(dir.work, 'example.txt'), 'old')
      const written = await saveDownloadedFile('../../example.txt', Buffer.from('new'), dir.work)
      expect(written.startsWith(dir.work + sep)).toBe(true)
      expect(basename(written)).toMatch(/^\d+-example\.txt$/)
      expect(await readFile(written, 'utf8')).toBe('new')
      expect(await readFile(join(dir.work, 'example.txt'), 'utf8')).toBe('old')
      await expect(access(join(dir.sandbox, 'example.txt'))).rejects.toThrow()
      await expect(access(join(dir.sandbox, 'nested', 'example.txt'))).rejects.toThrow()
    } finally {
      await dir.cleanup()
    }
  })

  it('does not create a file for an unsafe basename', async () => {
    const dir = await workspace()
    try {
      await expect(saveDownloadedFile('..', Buffer.from('x'), dir.work)).rejects.toThrow('Invalid file name')
      await expect(saveDownloadedFile('.', Buffer.from('x'), dir.work)).rejects.toThrow('Invalid file name')
      await expect(saveDownloadedFile('', Buffer.from('x'), dir.work)).rejects.toThrow('Invalid file name')
      expect(await readdir(dir.work)).toEqual([])
    } finally {
      await dir.cleanup()
    }
  })
})
