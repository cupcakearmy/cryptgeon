export class Files {
	static toString(f: File | Blob): Promise<string> {
		const reader = new window.FileReader()
		reader.readAsDataURL(f)
		return new Promise((resolve) => {
			reader.onloadend = () => resolve(reader.result as string)
		})
	}

	static async fromString(s: string): Promise<Blob> {
		return fetch(s).then((r) => r.blob())
	}
}
