import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 정적 호스팅(하위 경로 포함)에서도 열리도록 상대 경로로 빌드합니다.
  base: './',
  server: {
    // 같은 와이파이의 폰에서 바로 열어볼 수 있게 합니다.
    host: true,
    port: 5173,
  },
});
