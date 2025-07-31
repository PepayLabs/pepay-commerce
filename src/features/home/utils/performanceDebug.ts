// Simple performance debugging utility
export const performanceDebug = {
  // Track component renders
  logRender: (componentName: string, props?: any) => {
    if (import.meta.env.DEV) {
      console.log(`🔄 Render: ${componentName}`, props);
    }
  },

  // Track expensive operations
  timeOperation: async <T,>(
    operationName: string,
    operation: () => Promise<T> | T
  ): Promise<T> => {
    if (!import.meta.env.DEV) {
      return await operation();
    }

    const start = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - start;
      
      if (duration > 50) {
        console.warn(`⚠️ Slow operation: ${operationName} took ${duration.toFixed(2)}ms`);
      } else {
        console.log(`✅ ${operationName}: ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`❌ ${operationName} failed after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  },

  // Memory usage check
  checkMemory: () => {
    if (import.meta.env.DEV && 'memory' in performance) {
      const memory = (performance as any).memory;
      const used = (memory.usedJSHeapSize / 1048576).toFixed(2);
      const total = (memory.totalJSHeapSize / 1048576).toFixed(2);
      console.log(`💾 Memory: ${used}MB / ${total}MB`);
    }
  }
};