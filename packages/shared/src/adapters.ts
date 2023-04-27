import { AES, Bytes, type TypedArray } from 'occulto'
import type { EncryptedFileDTO, FileDTO } from './api'

abstract class CryptAdapter<T> {
  abstract encrypt(plaintext: T, key: TypedArray): Promise<string>
  abstract decrypt(ciphertext: string, key: TypedArray): Promise<T>
}

class CryptTextAdapter implements CryptAdapter<string> {
  async encrypt(plaintext: string, key: TypedArray) {
    return await AES.encrypt(Bytes.encode(plaintext), key)
  }
  async decrypt(ciphertext: string, key: TypedArray) {
    return Bytes.decode(await AES.decrypt(ciphertext, key))
  }
}

class CryptBlobAdapter implements CryptAdapter<TypedArray> {
  async encrypt(plaintext: TypedArray, key: TypedArray) {
    return await AES.encrypt(plaintext, key)
  }

  async decrypt(ciphertext: string, key: TypedArray) {
    return await AES.decrypt(ciphertext, key)
    // const plaintext = await AES.decrypt(ciphertext, key)
    // return new Blob([plaintext], { type: 'application/octet-stream' })
  }
}

class CryptFilesAdapter implements CryptAdapter<FileDTO[]> {
  async encrypt(plaintext: FileDTO[], key: TypedArray) {
    const adapter = new CryptBlobAdapter()
    const data: Promise<EncryptedFileDTO>[] = plaintext.map(async (file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      contents: await adapter.encrypt(file.contents, key),
    }))
    return JSON.stringify(await Promise.all(data))
  }

  async decrypt(ciphertext: string, key: TypedArray) {
    const adapter = new CryptBlobAdapter()
    const data: EncryptedFileDTO[] = JSON.parse(ciphertext)
    const files: FileDTO[] = await Promise.all(
      data.map(async (file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        contents: await adapter.decrypt(file.contents, key),
      }))
    )
    return files
  }
}

export const Adapters = {
  Text: new CryptTextAdapter(),
  Blob: new CryptBlobAdapter(),
  Files: new CryptFilesAdapter(),
}
