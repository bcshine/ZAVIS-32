// ZAVIS PWA v3.0 - 완전 새 버전 (인증 제거)
const CACHE_NAME = 'zavis-new-v3.0';
const urlsToCache = [
  './',
  './index.html',
  './mp1.png',
  './manifest.json'
];

// 설치 이벤트 - 안정적인 PWA 설치
self.addEventListener('install', event => {
  console.log('🚀 ZAVIS PWA v3.0 설치 중...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('💾 필수 파일 캐시 중...');
      return cache.addAll(urlsToCache);
    }).then(() => {
      console.log('✅ ZAVIS PWA v3.0 설치 완료!');
      // skipWaiting 제거 - PWA 설치 안정성 향상
    })
  );
});

// 활성화 이벤트 - 기존 캐시 정리 후 활성화
self.addEventListener('activate', event => {
  console.log('🔄 ZAVIS PWA v3.0 활성화 중...');
  
  event.waitUntil(
    // 기존 캐시 정리
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ 기존 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ ZAVIS PWA v3.0 활성화 완료!');
      return self.clients.claim();
    })
  );
});

// Fetch 이벤트 - 심플한 캐시 전략
self.addEventListener('fetch', event => {
  const request = event.request;
  
  // GET 요청만 캐시 처리
  if (request.method !== 'GET') {
    return;
  }
  
  // 외부 리소스는 네트워크에서만 처리
  if (request.url.startsWith('chrome-extension://') ||
      request.url.startsWith('data:') ||
      request.url.includes('chatgpt.com') ||
      request.url.includes('cdn.jsdelivr.net')) {
    event.respondWith(fetch(request));
    return;
  }
  
  // 캐시 우선, 없으면 네트워크
  event.respondWith(
    caches.match(request).then(response => {
      if (response) {
        return response; // 캐시에서 반환
      }
      
      // 네트워크에서 가져와서 캐시에 저장
      return fetch(request).then(fetchResponse => {
        if (fetchResponse.status === 200) {
          const responseClone = fetchResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return fetchResponse;
      });
    })
  );
});