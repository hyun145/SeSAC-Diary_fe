import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": "/src",
        },
        extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"], // 추가 확장자 명시
    },
});