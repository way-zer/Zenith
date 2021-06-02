import {defineConfig} from 'vite'
import {resolve} from 'path'
import {visualizer} from 'rollup-plugin-visualizer'

export default defineConfig(({command}) => ({
    plugins: [
        visualizer(),
    ],
    resolve: {
        alias: [
            {find: '@', replacement: resolve(__dirname, 'src')},
        ],
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('@leancloud/play'))
                        return 'leanCloud'
                },
            },
        },
    },
    server: {
        port: 8082,
    },
}))
