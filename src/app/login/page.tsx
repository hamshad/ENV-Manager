"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Github, Lock } from "lucide-react"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        router.push("/dashboard")
      }
    }
    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // Create or update profile
        const { error } = await supabase.from("profiles").upsert({
          id: session.user.id,
          username: session.user.user_metadata?.user_name || session.user.email?.split("@")[0] || "",
          full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || "",
          avatar_url: session.user.user_metadata?.avatar_url || "",
          github_username: session.user.user_metadata?.user_name || "",
        })

        if (!error) {
          router.push("/dashboard")
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleGithubLogin = async () => {
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      alert(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ctp-base flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-ctp-surface0 rounded-full mb-6">
            <Lock className="w-10 h-10 text-ctp-blue" />
          </div>
          <h1 className="text-4xl font-heading font-bold text-ctp-text mb-3">EnvManager</h1>
          <p className="text-ctp-subtext1 font-body text-lg">Securely manage your environment variables</p>
        </div>

        <div className="card p-8">
          <button
            onClick={handleGithubLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-4 px-6 py-4 bg-ctp-surface1 hover:bg-ctp-surface2 text-ctp-text border border-ctp-surface2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-body font-medium text-lg shadow-lg hover:shadow-xl"
          >
            <Github className="w-6 h-6" />
            {loading ? "Signing in..." : "Continue with GitHub"}
          </button>

          <p className="text-xs text-ctp-subtext0 text-center font-body mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
