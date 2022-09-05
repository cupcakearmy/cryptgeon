<script context="module">
	import { browser, dev } from '$app/env'
	import { status } from '$lib/stores/status'
	import AboutParagraph from '$lib/ui/AboutParagraph.svelte'

	export const hydrate = dev
	export const router = browser
</script>

<svelte:head>
	<title>About</title>
</svelte:head>

<section class="content">
	<h1>About</h1>

	<p>
		<i>cryptgeon</i> is a secure, open source sharing note / file service inspired by
		<a href="https://privnote.com"><i>PrivNote</i></a>.
	</p>

	<AboutParagraph title="how does it work?">
		<span>
			each note has a generated <code>id (256bit)</code> and <code>key 256(bit)</code>. The
			<code>id</code>
			is used to save & retrieve the note. the note is then encrypted with aes in gcm mode on the client
			side with the <code>key</code> and then sent to the server. data is stored in memory and never
			persisted to disk. the server never sees the encryption key and cannot decrypt the contents of
			the notes even if it tried to.
		</span>
	</AboutParagraph>

	<AboutParagraph title="features">
		<ul>
			<li>server cannot decrypt contents due to client side encryption</li>
			<li>view and time constraints</li>
			<li>in memory, no persistence</li>
		</ul>
	</AboutParagraph>

	<AboutParagraph title="tech stack">
		<span>
			the backend is written in rust and the frontend is svelte and typescript.
			<br />
			you are welcomed to check & audit the
			<a href="https://github.com/cupcakearmy/cryptgeon" target="_blank" rel="noopener">
				source code
			</a>.
		</span>
	</AboutParagraph>

	<AboutParagraph title="translations">
		<span
			>translations are managed on <a href="https://lokalise.com/" target="_blank">Lokalise</a>,
			which granted an open source license to use the paid version. If you are interested in helping
			translating don't hesitate to contact me!
		</span>
	</AboutParagraph>

	<AboutParagraph title="attribution">
		<span>
			icons made by <a href="https://www.freepik.com" title="Freepik">freepik</a> from
			<a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>
		</span>
	</AboutParagraph>

	<AboutParagraph title="version">
		<span>
			{#if $status}
				<code>v{$status.version}</code>
			{/if}
		</span>
	</AboutParagraph>
</section>

<style>
	section {
		width: 100%;
	}

	ul {
		margin: 0;
		padding: 0;
		padding-left: 1rem;
		list-style: square;
	}
</style>
