/*
*vite.config.js
*
*This file sets up vite to work with this react project, while also proxying API requests
*to a local backend server to simplify development and avoid CORS issues. 
*/
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
