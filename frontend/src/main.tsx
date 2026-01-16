import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// #region agent log - CSP Debug (console + endpoint)
const logCSP = (location: string, message: string, data: any, hypothesisId: string) => {
  const logEntry = { location, message, data, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId };
  console.log('[CSP Debug]', logEntry);
  fetch('http://127.0.0.1:7242/ingest/b36927af-6ca5-4f4b-8938-4f4afe8aa116',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logEntry)}).catch(()=>{});
};

// Check meta tag CSP (Hypothesis A)
try {
  const metaTag = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  const metaContent = metaTag?.getAttribute('content') || 'NOT FOUND';
  logCSP('main.tsx:10', 'CSP Debug: Meta tag check', { 
    metaTagPresent: !!metaTag,
    hasUnsafeEval: metaContent.includes('unsafe-eval'),
    metaContent: metaContent.substring(0, 300)
  }, 'A');
} catch (e) {
  logCSP('main.tsx:15', 'CSP Debug: Meta tag check failed', { error: String(e) }, 'A');
}

// Check server headers (Hypothesis B)
(async () => {
  try {
    const response = await fetch(window.location.href, { method: 'HEAD', cache: 'no-store' });
    const cspHeader = response.headers.get('Content-Security-Policy');
    const allHeaders: Record<string, string> = {};
    response.headers.forEach((val, key) => { allHeaders[key] = val; });
    logCSP('main.tsx:22', 'CSP Debug: Server headers check', {
      hasCSPHeader: !!cspHeader,
      cspHeaderValue: cspHeader?.substring(0, 300) || 'none',
      hasUnsafeEval: cspHeader?.includes('unsafe-eval') || false,
      allHeaders: Object.keys(allHeaders)
    }, 'B');
  } catch (e) {
    logCSP('main.tsx:28', 'CSP Debug: Header check failed', { error: String(e) }, 'B');
  }
})();

// Check for CSP violations (Hypothesis D)
try {
  if ('PerformanceObserver' in window) {
    const violations: any[] = [];
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        violations.push({
          type: entry.entryType,
          name: entry.name,
          ...(entry as any)
        });
      }
    });
    
    try {
      observer.observe({ entryTypes: ['navigation', 'resource'] });
    } catch (e) {
      logCSP('main.tsx:45', 'CSP Debug: Observer setup failed', { error: String(e) }, 'D');
    }
    
    setTimeout(() => {
      logCSP('main.tsx:49', 'CSP Debug: Initial violations check', {
        violationCount: violations.length,
        violations: violations.slice(0, 5)
      }, 'D');
      
      // Listen for CSP reports
      window.addEventListener('securitypolicyviolation', (e: SecurityPolicyViolationEvent) => {
        logCSP('main.tsx:56', 'CSP Debug: CSP Violation EVENT detected', {
          blockedURI: e.blockedURI,
          violatedDirective: e.violatedDirective,
          effectiveDirective: e.effectiveDirective,
          originalPolicy: e.originalPolicy?.substring(0, 300),
          documentURI: e.documentURI,
          referrer: e.referrer,
          sourceFile: e.sourceFile,
          lineNumber: e.lineNumber,
          columnNumber: e.columnNumber
        }, 'D');
      }, true); // Use capture phase
    }, 1000);
  }
} catch (e) {
  logCSP('main.tsx:66', 'CSP Debug: Violation check setup failed', { error: String(e) }, 'D');
}
// #endregion

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
