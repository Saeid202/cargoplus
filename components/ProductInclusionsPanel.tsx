'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'

const PURPLE = '#4B1D8F'
const GOLD = '#D4AF37'

interface Certificate {
  id: string
  title: string
  description: string
  file_url?: string
}

interface ProductInclusionsPanelProps {
  whatIsIncluded?: string[] | null
  certificatesStandards?: Certificate[] | null
}

export function ProductInclusionsPanel({
  whatIsIncluded,
  certificatesStandards,
}: ProductInclusionsPanelProps) {
  // Only render if at least one field has data
  const hasWhatIsIncluded = whatIsIncluded && whatIsIncluded.length > 0
  const hasCertificates = certificatesStandards && certificatesStandards.length > 0

  // Determine which tabs to show
  const tabs = [
    { id: 'included', label: "What's Included in the Unit?", visible: hasWhatIsIncluded },
    { id: 'certificates', label: 'Certificates and Standards', visible: hasCertificates },
  ].filter((tab) => tab.visible)

  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id || 'included')

  if (!hasWhatIsIncluded && !hasCertificates) {
    return null
  }

  return (
    <div
      className="rounded-2xl overflow-hidden border mt-6"
      style={{
        borderColor: `${GOLD}55`,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
      }}
    >
      {/* Tab Headers */}
      {tabs.length > 1 && (
        <div className="flex border-b" style={{ borderColor: `${GOLD}33` }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 px-4 py-3 text-sm font-semibold transition-all duration-200"
              style={{
                color: activeTab === tab.id ? PURPLE : '#666666',
                backgroundColor: activeTab === tab.id ? `${PURPLE}08` : 'white',
                borderBottom: activeTab === tab.id ? `3px solid ${GOLD}` : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Tab Content */}
      <div className="p-6">
        {/* What's Included Tab */}
        {activeTab === 'included' && hasWhatIsIncluded && (
          <div className="space-y-3">
            <ul className="space-y-2">
              {whatIsIncluded!.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div
                    className="w-2 h-2 rounded-full shrink-0 mt-2"
                    style={{ backgroundColor: GOLD }}
                  />
                  <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Certificates & Standards Tab */}
        {activeTab === 'certificates' && hasCertificates && (
          <div className="space-y-5">
            {certificatesStandards!.map((cert) => (
              <div
                key={cert.id}
                className="pb-5 border-b last:pb-0 last:border-b-0"
                style={{ borderColor: `${GOLD}22` }}
              >
                <h3 className="font-bold text-base mb-2" style={{ color: PURPLE }}>
                  {cert.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">{cert.description}</p>
                {cert.file_url && (
                  <a
                    href={cert.file_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:opacity-90"
                    style={{
                      backgroundColor: `${GOLD}15`,
                      color: GOLD,
                      border: `1px solid ${GOLD}44`,
                    }}
                  >
                    <FileText className="h-4 w-4" />
                    Download Certificate
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
