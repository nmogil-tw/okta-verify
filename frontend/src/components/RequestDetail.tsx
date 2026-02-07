import { useState } from 'react'
import { DemoEvent } from '../types/events'
import { JsonView, defaultStyles } from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'

interface RequestDetailProps {
  event: DemoEvent
}

export default function RequestDetail({ event }: RequestDetailProps) {
  const [activeTab, setActiveTab] = useState<'request' | 'response'>('request')
  const [copied, setCopied] = useState<'request' | 'response' | null>(null)

  const copyToClipboard = (data: any, type: 'request' | 'response') => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="p-6 bg-neutral-50/50">
      <div className="border-b border-neutral-200 mb-6">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('request')}
            className={`px-5 py-3 font-semibold text-sm border-b-2 transition-all duration-200 ${
              activeTab === 'request'
                ? 'border-accent-blue text-accent-blue bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Request
          </button>
          <button
            onClick={() => setActiveTab('response')}
            className={`px-5 py-3 font-semibold text-sm border-b-2 transition-all duration-200 ${
              activeTab === 'response'
                ? 'border-accent-blue text-accent-blue bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Response
          </button>
        </div>
      </div>

      {activeTab === 'request' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-sm text-neutral-900">Request Payload</h4>
            <button
              onClick={() => copyToClipboard(event.request, 'request')}
              className={`text-xs font-semibold flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                copied === 'request'
                  ? 'bg-accent-green/10 text-accent-green'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800'
              }`}
            >
              {copied === 'request' ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="bg-white rounded-lg p-4 overflow-auto max-h-96 border border-neutral-200 shadow-soft font-mono text-xs">
            <JsonView
              data={event.request}
              shouldExpandNode={(level) => level < 2}
              style={defaultStyles}
            />
          </div>
        </div>
      )}

      {activeTab === 'response' && (
        <div>
          {event.response ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h4 className="font-bold text-sm text-neutral-900">Response Payload</h4>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                      event.response.status >= 200 && event.response.status < 300
                        ? 'bg-accent-green/10 text-accent-green border-accent-green/20'
                        : event.response.status >= 400
                        ? 'bg-accent-red/10 text-accent-red border-accent-red/20'
                        : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                    }`}
                  >
                    {event.response.status}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(event.response, 'response')}
                  className={`text-xs font-semibold flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    copied === 'response'
                      ? 'bg-accent-green/10 text-accent-green'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800'
                  }`}
                >
                  {copied === 'response' ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="bg-white rounded-lg p-4 overflow-auto max-h-96 border border-neutral-200 shadow-soft font-mono text-xs">
                <JsonView
                  data={event.response}
                  shouldExpandNode={(level) => level < 2}
                  style={defaultStyles}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-neutral-200">
              <svg
                className="w-12 h-12 text-neutral-300 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-sm text-neutral-500 font-semibold">No response data available</p>
            </div>
          )}
        </div>
      )}

      {event.metadata && Object.keys(event.metadata).length > 0 && (
        <div className="mt-6 pt-6 border-t border-neutral-200">
          <h4 className="font-bold text-sm text-neutral-900 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Metadata
          </h4>
          <div className="bg-white rounded-lg p-4 border border-neutral-200 shadow-soft font-mono text-xs">
            <JsonView
              data={event.metadata}
              shouldExpandNode={() => true}
              style={defaultStyles}
            />
          </div>
        </div>
      )}
    </div>
  )
}
