// Performance Monitoring Utility
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.observers = new Map();
        this.isEnabled = true;
    }

    // Start timing an operation
    startTimer(operationName) {
        if (!this.isEnabled) return;
        
        this.metrics.set(operationName, {
            startTime: performance.now(),
            endTime: null,
            duration: null
        });
    }

    // End timing an operation
    endTimer(operationName) {
        if (!this.isEnabled) return;
        
        const metric = this.metrics.get(operationName);
        if (metric) {
            metric.endTime = performance.now();
            metric.duration = metric.endTime - metric.startTime;
            
            // Log slow operations
            if (metric.duration > 100) {
                console.warn(`Slow operation detected: ${operationName} took ${metric.duration.toFixed(2)}ms`);
            }
        }
    }

    // Measure function execution time
    async measureFunction(fn, operationName) {
        this.startTimer(operationName);
        try {
            const result = await fn();
            return result;
        } finally {
            this.endTimer(operationName);
        }
    }

    // Monitor DOM performance
    observeDOMChanges(selector, callback) {
        const element = document.querySelector(selector);
        if (!element) return;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    callback(mutation);
                }
            });
        });

        observer.observe(element, {
            childList: true,
            subtree: true,
            attributes: true
        });

        this.observers.set(selector, observer);
    }

    // Monitor resource loading
    monitorResourceLoading() {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.entryType === 'resource') {
                    const duration = entry.duration;
                    if (duration > 1000) {
                        console.warn(`Slow resource load: ${entry.name} took ${duration.toFixed(2)}ms`);
                    }
                }
            });
        });

        observer.observe({ entryTypes: ['resource'] });
    }

    // Monitor long tasks
    monitorLongTasks() {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.duration > 50) {
                    console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
                }
            });
        });

        observer.observe({ entryTypes: ['longtask'] });
    }

    // Get performance metrics
    getMetrics() {
        const results = {};
        this.metrics.forEach((metric, name) => {
            results[name] = {
                duration: metric.duration,
                startTime: metric.startTime,
                endTime: metric.endTime
            };
        });
        return results;
    }

    // Clear metrics
    clearMetrics() {
        this.metrics.clear();
    }

    // Enable/disable monitoring
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }

    // Cleanup observers
    cleanup() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
    }
}

// Memory usage monitoring
class MemoryMonitor {
    static getMemoryInfo() {
        if ('memory' in performance) {
            return {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    static logMemoryUsage() {
        const memory = this.getMemoryInfo();
        if (memory) {
            const usedMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
            const totalMB = (memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
            console.log(`Memory usage: ${usedMB}MB / ${totalMB}MB`);
        }
    }
}

// Network performance monitoring
class NetworkMonitor {
    static getNetworkInfo() {
        if ('connection' in navigator) {
            return {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            };
        }
        return null;
    }

    static logNetworkInfo() {
        const network = this.getNetworkInfo();
        if (network) {
            console.log(`Network: ${network.effectiveType}, ${network.downlink}Mbps, ${network.rtt}ms RTT`);
        }
    }
}

// Create global performance monitor instance
const performanceMonitor = new PerformanceMonitor();

// Initialize performance monitoring
document.addEventListener('DOMContentLoaded', () => {
    // Monitor resource loading
    performanceMonitor.monitorResourceLoading();
    
    // Monitor long tasks
    performanceMonitor.monitorLongTasks();
    
    // Log initial memory usage
    MemoryMonitor.logMemoryUsage();
    
    // Log network info
    NetworkMonitor.logNetworkInfo();
});

// Export for global access
window.PerformanceMonitor = PerformanceMonitor;
window.MemoryMonitor = MemoryMonitor;
window.NetworkMonitor = NetworkMonitor;
window.performanceMonitor = performanceMonitor; 