import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    server: 'src/server.ts',
    vercel: 'src/vercel.ts',
  },
  format: ['esm'],
  clean: true,
  sourcemap: true,
  splitting: false,
  // Bundle @taskly/* workspace packages directly into the output
  // so the Dockerfile doesn't need monorepo context
  noExternal: [/^@taskly\//],
})
