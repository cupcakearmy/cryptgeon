# Cryptgeon CLI

The CLI is a functionally identical way to interact with cryptgeon notes.
It supports text, files, expiration, password, etc.

## Installation

```bash
npx cryptgeon

# Or install globally
npm -g install cryptgeon
cryptgeon
```

## Examples

```bash
# Create simple note
cryptgeon send text "Foo bar"

# Send two files
cryptgeon send file my.pdf picture.png

# 3 views
cryptgeon send text "My message" --views 3

# 10 minutes
cryptgeon send text "My message" --minutes 10

# Custom password
cryptgeon send text "My message" --password "1337"

# Password from stdin
echo "1337" | cryptgeon send text "My message"

# Open a link
cryptgeon open https://cryptgeon.org/note/16gOIkxWjCxYNuXM8tCqMUzl...
```

## Options

### Custom server

The default server is `cryptgeon.org`, however you can use any cryptgeon server by passing the `-s` or `--server` option, or by setting the `CRYPTGEON_SERVER` environment variable.

### Password

Optionally, just like in the web ui, you can choose to use a manual password. You can do that by passing the `-p` or `--password` options, or by piping it into stdin.

```bash
echo "my pw" | cryptgeon send text "my text"
cat pass.txt | cryptgeon send text "my text"
```
