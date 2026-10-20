import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { GameProvider } from './state/GameContext';
import './styles.css';

const container = document.getElementById('root');
if (!container) throw new Error('#root 를 찾을 수 없습니다.');

createRoot(container).render(
  <StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </StrictMode>,
);

/*
 * 서비스 워커 등록 — 한 번 연 뒤에는 오프라인에서도 열립니다 (public/sw.js).
 * 개발 모드에서는 캐시 때문에 수정이 안 보이는 일이 생기므로 등록하지 않습니다.
 * 등록이 실패해도 앱은 그대로 동작합니다 (아이에게 오류를 보여주지 않습니다).
 */
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
