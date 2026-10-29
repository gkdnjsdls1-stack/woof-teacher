/*
 * 서비스 워커 — 한 번 연 뒤에는 오프라인에서도 열리게 합니다 (SPEC 2번).
 *
 * 빌드할 때마다 파일 이름이 바뀌므로(해시) 목록을 미리 적어두지 않고,
 * 한 번 받은 파일을 그때그때 캐시에 넣는 방식을 씁니다.
 *  - 화면 이동(navigate): 네트워크 먼저, 실패하면 캐시 → 오프라인에서도 열림
 *  - 그 밖의 파일: 캐시 먼저 주고 뒤에서 조용히 새로 받아둠 → 빨리 뜸
 *
 * 개발 모드에서는 등록하지 않습니다 (src/main.tsx 참고).
 */

const CACHE = 'woof-teacher-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 예전 버전 캐시는 지웁니다.
      const names = await caches.keys();
      await Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // GET 이 아니거나 다른 사이트 요청은 건드리지 않습니다.
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);

      const fromNetwork = async () => {
        const response = await fetch(request);
        if (response && response.ok) {
          // 응답은 한 번만 읽을 수 있으므로 복사해서 캐시에 넣습니다.
          cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      };

      if (request.mode === 'navigate') {
        try {
          return await fromNetwork();
        } catch {
          const cached = await cache.match(request);
          if (cached) return cached;
          // navigate 요청은 보통 './' 로 캐시에 들어갑니다. index.html 도 함께 봐 둡니다.
          for (const key of ['./', './index.html']) {
            const fallback = await cache.match(key);
            if (fallback) return fallback;
          }
          throw new Error('offline and nothing cached');
        }
      }

      const cached = await cache.match(request);
      if (cached) {
        // 캐시를 바로 주고, 새 파일은 뒤에서 받아둡니다.
        fromNetwork().catch(() => {});
        return cached;
      }
      return fromNetwork();
    })(),
  );
});
