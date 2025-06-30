"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { encryptValue } from "@/lib/crypto"
import type { User } from "@supabase/supabase-js"
import { ArrowLeft, Github, Key, Lock, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

interface EnvVariable {
  key: string
  value: string
}

export default function AddEnvironmentPage() {
  const [user, setUser] = useState<User | null>(null)
  const [repoUrl, setRepoUrl] = useState("")
  const [repoName, setRepoName] = useState("")
  const [repoDescription, setRepoDescription] = useState("")
  const [envVariables, setEnvVariables] = useState<EnvVariable[]>([{ key: "", value: "" }])
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)
    }
    getUser()
  }, [router])

  const extractRepoName = (url: string) => {
    try {
      const match = url.match(/github\.com\/[^/]+\/([^/]+)/)
      return match ? match[1].replace(".git", "") : ""
    } catch {
      return ""
    }
  }

  const handleRepoUrlChange = (url: string) => {
    setRepoUrl(url)
    const name = extractRepoName(url)
    if (name) {
      setRepoName(name)
    }
  }

  const addEnvVariable = () => {
    setEnvVariables([...envVariables, { key: "", value: "" }])
  }

  const removeEnvVariable = (index: number) => {
    if (envVariables.length > 1) {
      setEnvVariables(envVariables.filter((_, i) => i !== index))
    }
  }

  const updateEnvVariable = (index: number, field: "key" | "value", value: string) => {
    const updated = envVariables.map((env, i) => (i === index ? { ...env, [field]: value } : env))
    setEnvVariables(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Validation
    if (!repoUrl || !repoName || !password) {
      alert("Please fill in all required fields")
      return
    }

    if (password.length < 6 || password.length > 16) {
      alert("Password must be between 6 and 16 characters")
      return
    }

    const validEnvVars = envVariables.filter((env) => env.key && env.value)
    if (validEnvVars.length === 0) {
      alert("Please add at least one environment variable")
      return
    }

    setLoading(true)

    try {
      // Create repository
      const { data: repoData, error: repoError } = await supabase
        .from("repositories")
        .insert({
          user_id: user.id,
          name: repoName,
          github_url: repoUrl,
          description: repoDescription || null,
        })
        .select()
        .single()

      if (repoError) throw repoError

      // Encrypt and save environment variables
      const envPromises = validEnvVars.map((env) => {
        const encryptedValue = encryptValue(env.value, password)
        return supabase.from("environment_variables").insert({
          repository_id: repoData.id,
          key: env.key,
          encrypted_value: encryptedValue,
        })
      })

      await Promise.all(envPromises)

      // Log activity
      await supabase.from("activities").insert({
        user_id: user.id,
        action: "Created repository",
        description: `Added environment variables for ${repoName}`,
        repository_id: repoData.id,
      })

      router.push("/dashboard")
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ctp-base">
      {/* Header */}
      <header className="border-b border-ctp-surface1 bg-ctp-mantle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2 text-ctp-text hover:text-ctp-blue font-body">
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-ctp-text mb-2">Add Environment Repository</h1>
          <p className="text-ctp-subtext1 font-body">
            Connect your GitHub repository and securely store environment variables
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Repository Card */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-ctp-blue/20 rounded-lg flex items-center justify-center">
                <Github className="w-5 h-5 text-ctp-blue" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-semibold text-ctp-text">Repository Information</h2>
                <p className="text-ctp-subtext1 font-body text-sm">Connect your GitHub repository</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="repoUrl" className="block text-sm font-body font-medium text-ctp-text mb-2">
                  GitHub Repository URL *
                </label>
                <input
                  id="repoUrl"
                  type="url"
                  value={repoUrl}
                  onChange={(e) => handleRepoUrlChange(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  required
                  className="w-full px-4 py-3 input-field rounded-lg font-body"
                />
              </div>

              <div>
                <label htmlFor="repoName" className="block text-sm font-body font-medium text-ctp-text mb-2">
                  Repository Name *
                </label>
                <input
                  id="repoName"
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  placeholder="my-awesome-project"
                  required
                  className="w-full px-4 py-3 input-field rounded-lg font-body"
                />
              </div>

              <div>
                <label htmlFor="repoDescription" className="block text-sm font-body font-medium text-ctp-text mb-2">
                  Description (optional)
                </label>
                <textarea
                  id="repoDescription"
                  value={repoDescription}
                  onChange={(e) => setRepoDescription(e.target.value)}
                  placeholder="Brief description of your project"
                  rows={3}
                  className="w-full px-4 py-3 input-field rounded-lg font-body resize-none"
                />
              </div>
            </div>
          </div>

          {/* Environment Variables Card */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-ctp-green/20 rounded-lg flex items-center justify-center">
                  <Key className="w-5 h-5 text-ctp-green" />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-semibold text-ctp-text">Environment Variables</h2>
                  <p className="text-ctp-subtext1 font-body text-sm">Add your key-value pairs</p>
                </div>
              </div>

              <button
                type="button"
                onClick={addEnvVariable}
                className="flex items-center gap-2 px-4 py-2 btn-secondary rounded-lg font-body font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Variable
              </button>
            </div>

            <div className="space-y-4">
              {envVariables.map((env, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={env.key}
                      onChange={(e) => updateEnvVariable(index, "key", e.target.value)}
                      placeholder="VARIABLE_NAME"
                      className="w-full px-4 py-3 input-field rounded-lg font-body font-mono"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={env.value}
                      onChange={(e) => updateEnvVariable(index, "value", e.target.value)}
                      placeholder="variable_value"
                      className="w-full px-4 py-3 input-field rounded-lg font-body font-mono"
                    />
                  </div>
                  {envVariables.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEnvVariable(index)}
                      className="p-3 text-ctp-red hover:bg-ctp-red/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Encryption Password Card */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-ctp-red/20 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-ctp-red" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-semibold text-ctp-text">Encryption Password</h2>
                <p className="text-ctp-subtext1 font-body text-sm">
                  Secure your environment variables with a password (6-16 characters)
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-body font-medium text-ctp-text mb-2">
                Password *
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter encryption password"
                minLength={6}
                maxLength={16}
                required
                className="w-full px-4 py-3 input-field rounded-lg font-body"
              />
              <p className="text-xs text-ctp-subtext0 font-body mt-2">
                Remember this password - you'll need it to decrypt your environment variables
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href="/dashboard" className="px-6 py-3 btn-secondary rounded-lg font-body font-medium">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 btn-primary rounded-lg font-body font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Repository"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
