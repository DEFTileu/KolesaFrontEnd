import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    open: true,
    allowedHosts: ["3487ca46ebc3.ngrok-free.app"]  // Add the ngrok URL here
  }
})
