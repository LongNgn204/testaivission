/**
 * ⚡ PERFORMANCE UTILITIES - Speed Optimization Helpers
 * 
 * Collection of utilities to boost app performance:
 * - Debouncing & Throttling
 * - Lazy loading helpers
 * - Memory optimization
 * - Cache management
 */

// ⚡ DEBOUNCE: Delay execution until user stops typing/acting
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ⚡ THROTTLE: Limit execution frequency (e.g., scroll events)
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 100
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ⚡ LAZY IMAGE LOADING: Load images only when visible
export function lazyLoadImage(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = reject;
    img.src = src;
  });
}

// ⚡ MEMORY CLEANUP: Clear unused data
export function clearOldCacheData(storageKey: string, maxAge: number = 7 * 24 * 60 * 60 * 1000) {
  try {
    const data = localStorage.getItem(storageKey);
    if (!data) return;
    
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      const cutoffDate = Date.now() - maxAge;
      const filtered = parsed.filter((item: any) => {
        const itemDate = new Date(item.date || item.timestamp || 0).getTime();
        return itemDate > cutoffDate;
      });
      
      if (filtered.length < parsed.length) {
        localStorage.setItem(storageKey, JSON.stringify(filtered));
        console.log(`🧹 Cleared ${parsed.length - filtered.length} old items from ${storageKey}`);
      }
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

// ⚡ REQUEST ANIMATION FRAME: Smooth animations
export function rafThrottle<T extends (...args: any[]) => any>(callback: T) {
  let requestId: number | null = null;
  
  return function throttled(...args: Parameters<T>) {
    if (requestId === null) {
      requestId = requestAnimationFrame(() => {
        requestId = null;
        callback(...args);
      });
    }
  };
}

// ⚡ INTERSECTION OBSERVER: Detect when elements are visible
export function createIntersectionObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = { threshold: 0.1 }
): IntersectionObserver {
  return new IntersectionObserver((entries) => {
    entries.forEach(callback);
  }, options);
}

// ⚡ PREFETCH: Load data before user needs it
export async function prefetchData<T>(
  fetchFn: () => Promise<T>,
  cacheKey: string,
  maxAge: number = 5 * 60 * 1000 // 5 minutes
): Promise<T> {
  const cached = sessionStorage.getItem(cacheKey);
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < maxAge) {
      console.log('⚡ Prefetch cache HIT:', cacheKey);
      return data;
    }
  }
  
  const data = await fetchFn();
  sessionStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
  return data;
}

// ⚡ BATCH UPDATES: Group multiple state updates
export function batchUpdates<T>(
  updates: Array<() => void>,
  delay: number = 0
): void {
  if (delay === 0) {
    updates.forEach(update => update());
  } else {
    setTimeout(() => {
      updates.forEach(update => update());
    }, delay);
  }
}

// ⚡ AUTO CLEANUP: Run cleanup on app initialization
export function initPerformanceOptimizations() {
  // Clear old test history (keep last 7 days)
  clearOldCacheData('vision_test_history', 7 * 24 * 60 * 60 * 1000);
  
  // Clear old chat cache
  clearOldCacheData('chat_history', 24 * 60 * 60 * 1000); // 1 day
  
  // Log performance metrics
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing;
    const loadTime = timing.loadEventEnd - timing.navigationStart;
    console.log(`⚡ Page load time: ${loadTime}ms`);
  }
}
