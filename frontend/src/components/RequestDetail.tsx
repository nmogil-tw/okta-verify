import { useState } from 'react'
import { DemoEvent } from '../types/events'
import { JsonView, defaultStyles } from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'

interface RequestDetailProps {
  event: DemoEvent
}

export default function RequestDetail({ event }: RequestDetailProps) {
  const [activeTab, setActiveTab] = useState<'request' | 'response'>('request')

  const copyToClipboard = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
  }

  return (
    <div className="p-4">
      <div className="border-b border-gray-200 mb-4">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('request')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'request'
                ? 'border-okta-blue text-okta-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Request
          </button>
          <button
            onClick={() => setActiveTab('response')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'response'
                ? 'border-okta-blue text-okta-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Response
          </button>
        </div>
      </div>

      {activeTab === 'request' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm text-gray-700">Request Payload</h4>
            <button
              onClick={() => copyToClipboard(event.request)}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy
            </button>
          </div>
          <div className="bg-gray-50 rounded-md p-3 overflow-auto max-h-96">
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
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-gray-700">Response Payload</h4>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      event.response.status >= 200 && event.response.status < 300
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {event.response.status}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(event.response)}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy
                </button>
              </div>
              <div className="bg-gray-50 rounded-md p-3 overflow-auto max-h-96">
                <JsonView
                  data={event.response}
                  shouldExpandNode={(level) => level < 2}
                  style={defaultStyles}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              No response data available
            </div>
          )}
        </div>
      )}

      {event.metadata && Object.keys(event.metadata).length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-semibold text-sm text-gray-700 mb-2">Metadata</h4>
          <div className="bg-gray-50 rounded-md p-3">
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
