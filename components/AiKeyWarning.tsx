import React from 'react';
import { ShieldAlert } from 'lucide-react';

export function AiKeyWarning() {
  const hasKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY);
  if (hasKey) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800">
      <div className="max-w-7xl mx-auto px-4 py-2 text-sm flex items-center gap-2" role="status" aria-live="polite">
        <ShieldAlert className="w-4 h-4" aria-hidden="true" />
        <span>
          AI features are disabled (missing VITE_GEMINI_API_KEY). Some functions like Chat/AI reports will be limited.
        </span>
      </div>
    </div>
  );
}

