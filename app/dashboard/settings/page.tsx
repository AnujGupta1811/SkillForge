"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Settings, ExternalLink, Key, CheckCircle2, Loader2, AlertCircle, Trash2 } from "lucide-react"

type Provider = 'anthropic' | 'gemini'

export default function SettingsPage() {
  const [selectedProvider, setSelectedProvider] = useState<Provider>('anthropic')
  const [apiKey, setApiKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [anthropicPreview, setAnthropicPreview] = useState<string | null>(null)
  const [geminiPreview, setGeminiPreview] = useState<string | null>(null)
  const [preferredProvider, setPreferredProvider] = useState<Provider>('anthropic')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [switchingProvider, setSwitchingProvider] = useState(false)

  useEffect(() => {
    fetchKeyStatus()
  }, [])

  async function fetchKeyStatus() {
    try {
      const res = await fetch("/api/user/api-key")
      const data = await res.json()
      if (data.anthropic?.has_key) setAnthropicPreview(data.anthropic.key_preview)
      else setAnthropicPreview(null)
      if (data.gemini?.has_key) setGeminiPreview(data.gemini.key_preview)
      else setGeminiPreview(null)
      const pref: Provider = data.preferred_provider || 'anthropic'
      setPreferredProvider(pref)
      setSelectedProvider(pref)
    } catch (e) {
      console.error("Failed to fetch key status", e)
    } finally {
      setChecking(false)
    }
  }

  const currentPreview = selectedProvider === 'anthropic' ? anthropicPreview : geminiPreview
  const keyPrefix = selectedProvider === 'anthropic' ? 'sk-ant-' : 'AIza'
  const isValidKey = apiKey.startsWith(keyPrefix)
  const bothKeysPresent = !!anthropicPreview && !!geminiPreview

  function selectProvider(p: Provider) {
    setSelectedProvider(p)
    setApiKey("")
    setError(null)
    setShowDeleteConfirm(false)
    setSuccess(false)
  }

  async function handleSave() {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch("/api/user/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey, provider: selectedProvider }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to save API key")
      } else {
        setSuccess(true)
        setApiKey("")
        setTimeout(() => {
          fetchKeyStatus()
          setSuccess(false)
        }, 2000)
      }
    } catch (e) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    setLoading(true)
    try {
      const res = await fetch(`/api/user/api-key?provider=${selectedProvider}`, { method: "DELETE" })
      if (res.ok) {
        if (selectedProvider === 'anthropic') setAnthropicPreview(null)
        else setGeminiPreview(null)
        setShowDeleteConfirm(false)
      }
    } catch (e) {
      console.error("Failed to delete key", e)
    } finally {
      setLoading(false)
    }
  }

  async function handleSwitchProvider() {
    const newProvider: Provider = preferredProvider === 'anthropic' ? 'gemini' : 'anthropic'
    setSwitchingProvider(true)
    try {
      const res = await fetch("/api/user/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferred_provider: newProvider }),
      })
      if (res.ok) {
        setPreferredProvider(newProvider)
      }
    } catch (e) {
      console.error("Failed to switch provider", e)
    } finally {
      setSwitchingProvider(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activeHref="/dashboard/settings" />

      <main className="flex-1 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Settings className="h-6 w-6 text-violet-600" />
              </div>
              <h1 className="text-2xl font-bold text-[#0f172a]">Settings</h1>
            </div>
            <p className="text-[#64748b]">Manage your account and API keys</p>
          </header>

          {checking ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-xl border border-[#e2e8f0] bg-white p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-[#0f172a] flex items-center gap-2">
                    <Key className="h-5 w-5 text-violet-500" />
                    AI Provider
                  </h2>
                  <p className="text-sm text-[#64748b] mt-1">
                    Choose your AI provider and add your API key. Your key is used for
                    problem curation and project generation.
                  </p>
                </div>

                {/* Provider Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {/* Anthropic */}
                  <button
                    onClick={() => selectProvider('anthropic')}
                    className={`relative text-left rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                      selectedProvider === 'anthropic'
                        ? 'border-[#7c3aed] bg-violet-50'
                        : 'border-[#e2e8f0] bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-lg font-bold text-[#7c3aed]">Claude</span>
                      {anthropicPreview && (
                        <span className="text-[10px] font-medium text-green-600 bg-green-100 border border-green-100 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-slate-500 mb-1">claude-sonnet-4-6</p>
                    <p className="text-sm text-slate-700 font-medium mb-1">Most capable. Best project specs.</p>
                    <p className="text-xs text-slate-500 mb-3">~$0.01–0.03 per call. $5 free credits to start.</p>
                    <a
                      href="https://console.anthropic.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-medium text-[#7c3aed] hover:underline flex items-center gap-1"
                    >
                      Get key <ExternalLink className="h-3 w-3" />
                    </a>
                  </button>

                  {/* Gemini */}
                  <button
                    onClick={() => selectProvider('gemini')}
                    className={`relative text-left rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                      selectedProvider === 'gemini'
                        ? 'border-[#4285f4] bg-blue-50'
                        : 'border-[#e2e8f0] bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-lg font-bold text-[#4285f4]">Gemini</span>
                      <span className="text-[10px] font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        FREE TIER
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-500 mb-1">gemini-2.5-flash</p>
                    <p className="text-sm text-slate-700 font-medium mb-1">Free tier available. Great for getting started.</p>
                    <p className="text-xs text-slate-500 mb-3">Free tier: 15 req/min, 1500/day. No credit card needed.</p>
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-medium text-[#4285f4] hover:underline flex items-center gap-1"
                    >
                      Get key <ExternalLink className="h-3 w-3" />
                    </a>
                  </button>
                </div>

                {/* Key input for selected provider */}
                <div className="border-t border-slate-100 pt-5">
                  {selectedProvider === 'gemini' && !currentPreview && (
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        FREE TIER AVAILABLE
                      </span>
                      <span className="text-xs text-slate-500">No credit card needed</span>
                    </div>
                  )}

                  {currentPreview ? (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1 font-mono text-sm bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-600">
                          {currentPreview}
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Active
                        </div>
                      </div>

                      {!showDeleteConfirm ? (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1.5"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove Key
                        </button>
                      ) : (
                        <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                          <p className="text-sm text-red-800 font-medium mb-3">
                            Are you sure? You won&apos;t be able to use AI features without a key.
                          </p>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={handleDelete}
                              disabled={loading}
                              className="bg-red-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                              {loading ? "Removing..." : "Yes, remove"}
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(false)}
                              className="text-slate-600 text-sm px-4 py-2 rounded-lg hover:bg-slate-100"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          {selectedProvider === 'anthropic' ? 'Anthropic' : 'Gemini'} API Key
                        </label>
                        <input
                          type="password"
                          placeholder={selectedProvider === 'anthropic' ? 'sk-ant-...' : 'AIza...'}
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                        />
                        <p className="mt-1.5 text-xs text-[#64748b]">
                          Your key is stored securely and never shared
                        </p>
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                          <AlertCircle className="h-4 w-4" />
                          {error}
                        </div>
                      )}

                      {success && (
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
                          <CheckCircle2 className="h-4 w-4" />
                          API key verified and saved!
                        </div>
                      )}

                      <button
                        onClick={handleSave}
                        disabled={loading || !isValidKey}
                        className="w-full sm:w-auto bg-[#7c3aed] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#6d28d9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Save & Verify Key"
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Active provider indicator — only when both keys are saved */}
                {bothKeysPresent && (
                  <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                    <p className="text-sm text-slate-700">
                      Currently using:{" "}
                      <span className="font-medium">
                        {preferredProvider === 'anthropic' ? 'Anthropic Claude' : 'Google Gemini'}
                      </span>
                    </p>
                    <button
                      onClick={handleSwitchProvider}
                      disabled={switchingProvider}
                      className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {switchingProvider ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Switching...
                        </>
                      ) : (
                        `Switch to ${preferredProvider === 'anthropic' ? 'Gemini' : 'Anthropic'}`
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
