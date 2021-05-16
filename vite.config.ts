import {defineConfig} from 'vite'

const {resolve} = require('path')

export default defineConfig({
    resolve: {
        alias: [
            {find: '@', replacement: resolve(__dirname, 'src')},
        ],
    },
    server: {
        port: 8082,
    },
})
