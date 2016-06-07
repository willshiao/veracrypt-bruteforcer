veracrypt-bruteforcer
====
A node.js script to try different passwords from a wordlist to mount a Veracrypt volume.

Note that this uses the VeraCrypt CLI and goes through passwords one at a time so it does not go very quickly. This tool should only be used to recover forgotten passwords (and you have some idea of what the password is).

**Note that this program only currently works on Windows.**

## Usage

`node app.js -w \path\to\wordlist -v \path\to\volume -l A [-p \path\to\VeraCrypt.exe]`

#### Arguments

- `-w path`
    + `path` is the path to the wordlist file.
    + The wordlist should have each possible password on a new line.
    + It can be a relative or absolute path, but should be surrounded in quotes if it contains a space.
    + Example: `-w "C:\My Files\wordlist.txt"`
- `-v path`
    + `path` is the path to the encrypted VeraCrypt container.
    + It should be an absolute path and should be surrounded in quotes if it contains a space.
    + Example: `-v "C:\My Files\encrypted"`
- `-l letter`
    + `letter` should be the drive letter to be mounted as.
    + It should be a single English alphabet letter with no slashes or colons.
    + Example: `-l A`
- `-p path`
    + `path` should be the path to `VeraCrypt.exe`.
    + Optional parameter, defaults to `D:\Program Files\VeraCrypt\VeraCrypt.exe`.
    + Example: `-p "C:\Program Files\VeraCrypt\VeraCrypt.exe"`