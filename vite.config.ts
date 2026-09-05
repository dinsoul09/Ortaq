import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Когда будешь подключать реальную программу (chain.ts), доставь:
//   npm i @coral-xyz/anchor @solana/web3.js @solana/spl-token
//   npm i -D vite-plugin-node-polyfills
// и добавь сюда nodePolyfills({ globals: { Buffer: true } }) —
// без этого будет "Buffer is not defined" при первом обращении к сети.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
