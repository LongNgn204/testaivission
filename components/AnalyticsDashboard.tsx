import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Activity, Zap } from 'lucide-react';
import { analytics, EventType } from '../services/analyticsService';
import { performanceMonitoring } from '../services/performanceMonitoringService';

/**
 * Analytics Dashboard - Development/Admin only
 * Shows real-time analytics and performance metrics
 */
export function AnalyticsDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'performance'>('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  // Only show in development
  if (!import.meta.env.DEV) {
    return null;
  }

  const summary = analytics.getSummary();
  const perfReport = performanceMonitoring.getReport();
  const events = analytics.getEvents();

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const getEventColor = (type: EventType) => {
    if (type.includes('error')) return 'bg-red-100 text-red-800';
    if (type.includes('test')) return 'bg-blue-100 text-blue-800';
    if (type.includes('ai')) return 'bg-purple-100 text-purple-800';
    if (type.includes('badge')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed top-4 right-4 z-40 font-sans text-sm">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-lg"
      >
        <BarChart3 className="w-4 h-4" />
        Analytics
      </button>

      {/* Dashboard */}
      {isOpen && (
        <div className="absolute top-12 right-0 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border dark:border-gray-700 w-screen max-w-2xl max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-indigo-50 dark:bg-indigo-900 px-4 py-3 border-b dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-indigo-900 dark:text-indigo-100">Analytics Dashboard</h3>
            <button
              onClick={handleRefresh}
              className="text-indigo-600 dark:text-indigo-400 hover:opacity-75"
            >
              🔄
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'overview'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'events'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Events ({events.length})
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'performance'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Performance
            </button>
          </div>

          {/* Content */}
          <div key={refreshKey} className="flex-1 overflow-auto p-4 space-y-3">
            {activeTab === 'overview' && (
              <>
                {/* Session Info */}
                <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded">
                  <div className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Session
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">ID:</span>
                      <div className="font-mono text-blue-600 dark:text-blue-400 truncate">
                        {summary.sessionId.substring(0, 12)}...
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                      <div className="font-bold text-blue-600 dark:text-blue-400">
                        {summary.duration}s
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Page Views:</span>
                      <div className="font-bold text-blue-600 dark:text-blue-400">
                        {summary.pageViews}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Events:</span>
                      <div className="font-bold text-blue-600 dark:text-blue-400">
                        {summary.events}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Events */}
                <div className="bg-purple-50 dark:bg-purple-900 p-3 rounded">
                  <div className="text-xs font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    Top Events
                  </div>
                  <div className="space-y-1">
                    {Object.entries(summary.eventsByType)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([type, count]) => (
                        <div key={type} className="flex justify-between text-xs">
                          <span className="text-gray-700 dark:text-gray-300">{type}:</span>
                          <span className="font-bold text-purple-600 dark:text-purple-400">
                            {count}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'events' && (
              <div className="space-y-2">
                {events.length === 0 ? (
                  <div className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No events recorded
                  </div>
                ) : (
                  events
                    .slice(-10)
                    .reverse()
                    .map((event) => (
                      <div
                        key={event.id}
                        className={`p-2 rounded text-xs ${getEventColor(event.type)}`}
                      >
                        <div className="font-semibold">{event.type}</div>
                        {event.properties && (
                          <div className="text-xs opacity-75 mt-1">
                            {JSON.stringify(event.properties).substring(0, 100)}...
                          </div>
                        )}
                        <div className="text-xs opacity-50 mt-1">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}

            {activeTab === 'performance' && (
              <>
                {/* Performance Score */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 p-3 rounded">
                  <div className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                    Performance Score
                  </div>
                  <div className={`text-3xl font-bold ${getPerformanceColor(perfReport.performanceScore)}`}>
                    {perfReport.performanceScore}
                    <span className="text-sm">/100</span>
                  </div>
                </div>

                {/* Core Web Vitals */}
                <div className="bg-indigo-50 dark:bg-indigo-900 p-3 rounded">
                  <div className="text-xs font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                    Core Web Vitals
                  </div>
                  <div className="space-y-2">
                    {/* LCP */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-700 dark:text-gray-300">LCP</span>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400">
                          {perfReport.coreWebVitals.lcp.value
                            ? `${perfReport.coreWebVitals.lcp.value}ms`
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-1">
                        <div
                          className={`h-1 rounded ${
                            perfReport.coreWebVitals.lcp.status === 'good'
                              ? 'bg-green-500'
                              : perfReport.coreWebVitals.lcp.status === 'needs-improvement'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{
                            width: `${Math.min(100, ((perfReport.coreWebVitals.lcp.value || 0) / 4000) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* FID */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-700 dark:text-gray-300">FID</span>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400">
                          {perfReport.coreWebVitals.fid.value
                            ? `${perfReport.coreWebVitals.fid.value}ms`
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-1">
                        <div
                          className={`h-1 rounded ${
                            perfReport.coreWebVitals.fid.status === 'good'
                              ? 'bg-green-500'
                              : perfReport.coreWebVitals.fid.status === 'needs-improvement'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{
                            width: `${Math.min(100, ((perfReport.coreWebVitals.fid.value || 0) / 300) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* CLS */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-700 dark:text-gray-300">CLS</span>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400">
                          {perfReport.coreWebVitals.cls.value || 'N/A'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-1">
                        <div
                          className={`h-1 rounded ${
                            perfReport.coreWebVitals.cls.status === 'good'
                              ? 'bg-green-500'
                              : perfReport.coreWebVitals.cls.status === 'needs-improvement'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{
                            width: `${Math.min(100, ((perfReport.coreWebVitals.cls.value || 0) / 0.25) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Other Metrics */}
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  <div className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                    Other Metrics
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">FCP:</span>
                      <div className="font-mono text-gray-900 dark:text-white">
                        {perfReport.metrics.fcp ? `${perfReport.metrics.fcp}ms` : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">TTFB:</span>
                      <div className="font-mono text-gray-900 dark:text-white">
                        {perfReport.metrics.ttfb ? `${perfReport.metrics.ttfb}ms` : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Resources:</span>
                      <div className="font-mono text-gray-900 dark:text-white">
                        {perfReport.metrics.resourceCount || 0}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Size:</span>
                      <div className="font-mono text-gray-900 dark:text-white">
                        {perfReport.metrics.totalResourceSize
                          ? `${(perfReport.metrics.totalResourceSize / 1024 / 1024).toFixed(2)}MB`
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

