import React, { useState } from 'react';
import { ChevronDown, Download, Trash2, Code } from 'lucide-react';
import { logger, LogLevel, LogData } from '../services/loggingService';

/**
 * Debug Panel - Development only
 * Shows logs, metrics, and performance data
 */
export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'metrics' | 'performance'>('logs');
  const [filterLevel, setFilterLevel] = useState<LogLevel | 'ALL'>('ALL');

  // Only show in development
  if (!import.meta.env.DEV) {
    return null;
  }

  const logs = logger.getLogs();
  const metrics = logger.getMetrics();
  const filteredLogs =
    filterLevel === 'ALL' ? logs : logs.filter((log) => log.level === filterLevel);

  const handleExport = () => {
    const data = logger.exportLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm('Clear all logs?')) {
      logger.clearLogs();
    }
  };

  const getLogColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.DEBUG:
        return 'text-gray-500';
      case LogLevel.INFO:
        return 'text-blue-600';
      case LogLevel.WARN:
        return 'text-yellow-600';
      case LogLevel.ERROR:
        return 'text-red-600';
    }
  };

  return (
    <div className="fixed bottom-0 right-0 z-40 font-mono text-xs">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-900 text-white px-3 py-2 rounded-t-lg hover:bg-gray-800 flex items-center gap-2 border-t border-gray-700"
      >
        <Code className="w-4 h-4" />
        Debug
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="bg-gray-900 text-gray-100 border-t border-gray-700 w-screen max-w-2xl max-h-96 overflow-hidden flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-700 bg-gray-800">
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-2 ${
                activeTab === 'logs'
                  ? 'bg-gray-700 border-b-2 border-blue-500'
                  : 'hover:bg-gray-700'
              }`}
            >
              Logs ({filteredLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-3 py-2 ${
                activeTab === 'metrics'
                  ? 'bg-gray-700 border-b-2 border-blue-500'
                  : 'hover:bg-gray-700'
              }`}
            >
              Metrics ({metrics.length})
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-3 py-2 ${
                activeTab === 'performance'
                  ? 'bg-gray-700 border-b-2 border-blue-500'
                  : 'hover:bg-gray-700'
              }`}
            >
              Performance
            </button>

            {/* Actions */}
            <div className="ml-auto flex gap-2 px-3 py-2">
              {activeTab === 'logs' && (
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value as LogLevel | 'ALL')}
                  className="bg-gray-700 text-white px-2 py-1 rounded text-xs"
                >
                  <option value="ALL">All</option>
                  <option value={LogLevel.DEBUG}>Debug</option>
                  <option value={LogLevel.INFO}>Info</option>
                  <option value={LogLevel.WARN}>Warn</option>
                  <option value={LogLevel.ERROR}>Error</option>
                </select>
              )}
              <button
                onClick={handleExport}
                className="hover:bg-gray-700 p-1 rounded"
                title="Export logs"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={handleClear}
                className="hover:bg-gray-700 p-1 rounded"
                title="Clear logs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto bg-gray-950 p-2 space-y-1">
            {activeTab === 'logs' && (
              <>
                {filteredLogs.length === 0 ? (
                  <div className="text-gray-500">No logs</div>
                ) : (
                  filteredLogs.map((log) => (
                    <div key={log.id} className="hover:bg-gray-800 p-1 rounded">
                      <div className={`${getLogColor(log.level)} font-bold`}>
                        [{log.timestamp.split('T')[1].split('.')[0]}] [{log.level}] {log.message}
                      </div>
                      {log.context && Object.keys(log.context).length > 0 && (
                        <div className="text-gray-400 ml-4">
                          {JSON.stringify(log.context, null, 2)
                            .split('\n')
                            .map((line, i) => (
                              <div key={i}>{line}</div>
                            ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'metrics' && (
              <>
                {metrics.length === 0 ? (
                  <div className="text-gray-500">No metrics</div>
                ) : (
                  metrics.map((metric, i) => (
                    <div key={i} className="hover:bg-gray-800 p-1 rounded text-green-400">
                      <div className="font-bold">
                        {metric.name}: {metric.duration.toFixed(2)}ms
                      </div>
                      {metric.context && Object.keys(metric.context).length > 0 && (
                        <div className="text-gray-400 ml-4">
                          {JSON.stringify(metric.context, null, 2)
                            .split('\n')
                            .map((line, i) => (
                              <div key={i}>{line}</div>
                            ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'performance' && (
              <div className="text-gray-300">
                <div className="mb-2">
                  <strong>Performance Metrics:</strong>
                </div>
                <div>
                  Total Logs: <span className="text-blue-400">{logs.length}</span>
                </div>
                <div>
                  Total Metrics: <span className="text-green-400">{metrics.length}</span>
                </div>
                <div>
                  Errors: <span className="text-red-400">{logs.filter((l) => l.level === LogLevel.ERROR).length}</span>
                </div>
                <div>
                  Warnings: <span className="text-yellow-400">{logs.filter((l) => l.level === LogLevel.WARN).length}</span>
                </div>
                {metrics.length > 0 && (
                  <>
                    <div className="mt-2">
                      <strong>Slowest Operations:</strong>
                    </div>
                    {metrics
                      .sort((a, b) => b.duration - a.duration)
                      .slice(0, 5)
                      .map((metric, i) => (
                        <div key={i} className="text-orange-400">
                          {metric.name}: {metric.duration.toFixed(2)}ms
                        </div>
                      ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

