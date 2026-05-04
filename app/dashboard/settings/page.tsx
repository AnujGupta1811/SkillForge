"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Settings, ExternalLink, Key, CheckCircle2, Loader2, AlertCircle, Trash2 } from "lucide-react"

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [savedKeyPreview, setSavedKeyPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    fetchKeyStatus()
  }, [])

  async function fetchKeyStatus() {
    try {
      const res = await fetch("/api/user/api-key")
      const data = await res.json()
      if (data.has_key) {
        setSavedKeyPreview(data.key_preview)
      }
    } catch (e) {
      console.error("Failed to fetch key status", e)
    } finally {
      setChecking(false)
    }
  }

  async function handleSave() {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch("/api/user/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to save API key")
      } else {
        setSuccess(true)
        setApiKey("")
        // Refresh status after a brief delay
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
      const res = await fetch("/api/user/api-key", { method: "DELETE" })
      if (res.ok) {
        setSavedKeyPreview(null)
        setShowDeleteConfirm(false)
      }
    } catch (e) {
      console.error("Failed to delete key", e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activeHref="/dashboard/settings" />
      
      <main className="flex-1 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
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
              {/* Anthropic API Key Card */}
              <div className="rounded-xl border border-[#e2e8f0] bg-white p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-[#0f172a] flex items-center gap-2">
                      <Key className="h-5 w-5 text-violet-500" />
                      Anthropic API Key
                    </h2>
                    <p className="text-sm text-[#64748b]">
                      Required to use AI features — problem curation and project generation
                    </p>
                  </div>
                  <a 
                    href="https://console.anthropic.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1"
                  >
                    Get your API key <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {savedKeyPreview ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 font-mono text-sm bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-600">
                        {savedKeyPreview}
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
                          Are you sure? You won't be able to use AI features without a key.
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
                        API Key
                      </label>
                      <input
                        type="password"
                        placeholder="sk-ant-..."
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
                      disabled={loading || !apiKey.startsWith("sk-ant-")}
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

              {/* Guide Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-4">How to get an API key</h3>
                <ol className="space-y-4 text-sm text-slate-600">
                  <li className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">1</span>
                    <span>Go to <a href="https://console.anthropic.com" target="_blank" className="text-violet-600 hover:underline">console.anthropic.com</a></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">2</span>
                    <span>Sign up or log in</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">3</span>
                    <span>Go to "API Keys" in the left sidebar</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">4</span>
                    <span>Click "Create Key"</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">5</span>
                    <span>Copy the key and paste it above</span>
                  </li>
                </ol>
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <p className="text-xs text-slate-500 italic">
                    Note: Free tier includes $5 of credits. Each AI call uses approximately $0.01–0.03.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
