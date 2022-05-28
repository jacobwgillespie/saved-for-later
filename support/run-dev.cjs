/// <reference types="node" />

const {spawnSync} = require('child_process')
require('dotenv/config')
process.env.NODE_ENV = 'development'
const statusCode = spawnSync(process.argv.slice(2).join(' '), {stdio: 'inherit', shell: true}).status
if (statusCode) process.exit(statusCode)
