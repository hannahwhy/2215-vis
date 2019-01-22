# Usage

1. Pipe app console output to a file, e.g. `grailsw run-app 2>&1 | tee out`
2. Run `out` through parse.rb: `ruby parse.rb out > data.json`
3. Update the URL in `index.js` to point to `data.json`
4. Load `index.html`
