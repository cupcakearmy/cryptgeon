import dotenv from 'dotenv'
import { LokaliseApi } from '@lokalise/node-api'
import https from 'https'
import AdmZip from 'adm-zip'

dotenv.config()

const apiKey = process.env.LOKALISE_API_KEY
const project_id = process.env.LOKALISE_PROJECT
if (!apiKey) throw new Error('No API Key set for Lokalize! Set with "LOKALISE_API_KEY"')
if (!project_id) throw new Error('No project id set for Lokalize! Set with "LOKALISE_PROJECT"')
const client = new LokaliseApi({ apiKey })

const WGet = (url) =>
	new Promise((done) => {
		https
			.get(url, (res) => {
				const data = []
				res
					.on('data', (chunk) => {
						data.push(chunk)
					})
					.on('end', () => {
						let buffer = Buffer.concat(data)
						done(buffer)
					})
			})
			.on('error', (err) => {
				console.log('download error:', err)
			})
	})

async function download() {
	// For details see: https://app.lokalise.com/api2docs/curl/#transition-download-files-post
	const download = await client.files().download(project_id, {
		format: 'json',
		indentation: 'tab',
		json_unescaped_slashes: true,
		original_filenames: false,
		bundle_structure: '%LANG_ISO%.%FORMAT%',
		export_sort: 'first_added',
		export_empty_as: 'skip',
		add_newline_eof: true,
		replace_breaks: false,
	})
	const buffered = await WGet(download.bundle_url)
	const zip = new AdmZip(buffered)
	zip.extractAllTo('./locales', true)
}

download().catch((e) => {
	console.error(e)
	process.exit(1)
})
