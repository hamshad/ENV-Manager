"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Github, Lock, Key, Database, Shield, Code, GitBranch, ExternalLink } from "lucide-react"
import Image from "next/image"

export default function LandingPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-ctp-base to-ctp-surface0 overflow-hidden relative">
      {/* Background shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-ctp-blue opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-ctp-mauve opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-60 h-60 bg-ctp-green opacity-5 rounded-full blur-3xl"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center px-6 md:px-12 py-6">
        <div className="flex items-center gap-2">
          <div className="bg-ctp-surface0 p-2 rounded-lg">
            <Lock className="w-6 h-6 text-ctp-blue" />
          </div>
          <span className="font-heading font-bold text-xl text-ctp-text">EnvManager</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-ctp-subtext0 hover:text-ctp-text transition-colors font-body">Features</a>
          <a href="#how-it-works" className="text-ctp-subtext0 hover:text-ctp-text transition-colors font-body">How It Works</a>
          <a href="#security" className="text-ctp-subtext0 hover:text-ctp-text transition-colors font-body">Security</a>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 pt-12 pb-24 md:pt-24 md:pb-32">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-heading font-bold text-ctp-text mb-6 leading-tight">
              Secure <span className="text-ctp-blue">Environment Variables</span> Management
            </h1>
            <p className="text-ctp-subtext1 font-body text-xl mb-8 max-w-xl">
              Connect your GitHub repositories directly with encrypted environment variables. Each environment is secured with unique passwords you control.
            </p>

            {/* GitHub Login Button - Positioned prominently */}
            <div className="relative inline-block">
              <button
                onClick={handleGithubLogin}
                disabled={loading}
                className="flex items-center justify-center gap-4 px-8 py-4 bg-ctp-blue hover:bg-ctp-sapphire text-white border-none rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed font-body font-medium text-lg shadow-lg hover:shadow-xl"
              >
                <Github className="w-6 h-6" />
                {loading ? "Signing in..." : "Continue with GitHub"}
              </button>
              <div className="absolute -bottom-6 w-full text-center">
                <p className="text-xs text-ctp-subtext0 font-body">
                  Secure Single Sign-On
                </p>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <div className="bg-ctp-surface0/80 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-ctp-surface2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-ctp-red"></div>
                <div className="w-3 h-3 rounded-full bg-ctp-yellow"></div>
                <div className="w-3 h-3 rounded-full bg-ctp-green"></div>
                <div className="ml-2 text-xs text-ctp-subtext0 font-mono">.env file manager</div>
              </div>
              <div className="bg-ctp-crust p-4 rounded-lg font-mono text-sm">
                <div className="flex items-center gap-2 text-ctp-green mb-2">
                  <Lock className="w-4 h-4" />
                  <span>Securely encrypted with your custom password</span>
                </div>
                <div className="text-ctp-subtext1">
                  <div className="mb-1"><span className="text-ctp-mauve">DB_PASSWORD</span>=<span className="text-ctp-green">••••••••••••</span></div>
                  <div className="mb-1"><span className="text-ctp-mauve">API_KEY</span>=<span className="text-ctp-green">••••••••••••</span></div>
                  <div className="mb-1"><span className="text-ctp-mauve">SECRET_TOKEN</span>=<span className="text-ctp-green">••••••••••••</span></div>
                  <div className="mb-1"><span className="text-ctp-mauve">AWS_ACCESS_KEY</span>=<span className="text-ctp-green">••••••••••••</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative z-10 bg-ctp-surface0/50 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-ctp-text text-center mb-16">
            Powerful Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-ctp-mantle/80 p-6 rounded-xl shadow-lg border border-ctp-surface1 hover:border-ctp-blue transition-all duration-200">
              <div className="bg-ctp-blue/10 p-4 rounded-lg inline-block mb-4">
                <GitBranch className="w-8 h-8 text-ctp-blue" />
              </div>
              <h3 className="text-xl font-heading font-bold text-ctp-text mb-3">GitHub Integration</h3>
              <p className="text-ctp-subtext0 font-body">
                Directly connect your GitHub repositories to manage environment variables across all your projects.
              </p>
            </div>

            <div className="bg-ctp-mantle/80 p-6 rounded-xl shadow-lg border border-ctp-surface1 hover:border-ctp-mauve transition-all duration-200">
              <div className="bg-ctp-mauve/10 p-4 rounded-lg inline-block mb-4">
                <Shield className="w-8 h-8 text-ctp-mauve" />
              </div>
              <h3 className="text-xl font-heading font-bold text-ctp-text mb-3">End-to-End Encryption</h3>
              <p className="text-ctp-subtext0 font-body">
                Each environment is secured with a unique password that only you know, ensuring maximum security.
              </p>
            </div>

            <div className="bg-ctp-mantle/80 p-6 rounded-xl shadow-lg border border-ctp-surface1 hover:border-ctp-green transition-all duration-200">
              <div className="bg-ctp-green/10 p-4 rounded-lg inline-block mb-4">
                <Key className="w-8 h-8 text-ctp-green" />
              </div>
              <h3 className="text-xl font-heading font-bold text-ctp-text mb-3">Custom Access Control</h3>
              <p className="text-ctp-subtext0 font-body">
                Manage who can view and edit your environment variables with granular permission controls.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-ctp-text text-center mb-16">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-ctp-surface0 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Github className="w-8 h-8 text-ctp-blue" />
              </div>
              <h3 className="text-xl font-heading font-bold text-ctp-text mb-2">1. Connect</h3>
              <p className="text-ctp-subtext0 font-body">
                Link your GitHub repository with a single click
              </p>
            </div>

            <div className="text-center">
              <div className="bg-ctp-surface0 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Key className="w-8 h-8 text-ctp-mauve" />
              </div>
              <h3 className="text-xl font-heading font-bold text-ctp-text mb-2">2. Secure</h3>
              <p className="text-ctp-subtext0 font-body">
                Set unique passwords for each environment
              </p>
            </div>

            <div className="text-center">
              <div className="bg-ctp-surface0 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Code className="w-8 h-8 text-ctp-green" />
              </div>
              <h3 className="text-xl font-heading font-bold text-ctp-text mb-2">3. Deploy</h3>
              <p className="text-ctp-subtext0 font-body">
                Access your environment variables securely in your application
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div id="security" className="relative z-10 bg-ctp-surface0/50 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-ctp-text text-center mb-8">
            Security First Approach
          </h2>
          <p className="text-ctp-subtext0 font-body text-center max-w-2xl mx-auto mb-12">
            EnvManager uses industry-leading encryption to ensure your secrets never leave your control.
            Each environment has its own unique encryption key that only you know.
          </p>

          <div className="bg-ctp-mantle/80 p-8 rounded-xl shadow-lg border border-ctp-surface1 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-1/3">
                <div className="bg-ctp-blue/10 p-6 rounded-full inline-flex items-center justify-center">
                  <Shield className="w-16 h-16 text-ctp-blue" />
                </div>
              </div>
              <div className="w-full md:w-2/3">
                <h3 className="text-xl font-heading font-bold text-ctp-text mb-4">End-to-End Encryption</h3>
                <ul className="space-y-2 text-ctp-subtext0 font-body">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 text-ctp-green">✓</div>
                    <span>AES-256 encryption for all environment variables</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 text-ctp-green">✓</div>
                    <span>Unique password for each environment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 text-ctp-green">✓</div>
                    <span>Passwords never stored on our servers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 text-ctp-green">✓</div>
                    <span>Zero-knowledge architecture</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section with Login Button Centered */}
      <div className="relative z-10 py-20 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-ctp-text mb-6">
            Ready to Secure Your Environment Variables?
          </h2>
          <p className="text-ctp-subtext1 font-body text-xl mb-10 max-w-2xl mx-auto">
            Join developers who trust EnvManager to secure their most sensitive configuration data.
          </p>

          {/* GitHub Login Button - Centered Absolute */}
          <div className="relative inline-block">
            <button
              onClick={handleGithubLogin}
              disabled={loading}
              className="flex items-center justify-center gap-4 px-8 py-4 bg-ctp-blue hover:bg-ctp-sapphire text-white border-none rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed font-body font-medium text-lg shadow-lg hover:shadow-xl"
            >
              <Github className="w-6 h-6" />
              {loading ? "Signing in..." : "Continue with GitHub"}
            </button>
            <p className="text-xs text-ctp-subtext0 text-center font-body mt-4">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-ctp-mantle py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="bg-ctp-surface0 p-1 rounded-lg">
                <Lock className="w-4 h-4 text-ctp-blue" />
              </div>
              <span className="font-heading font-bold text-sm text-ctp-text">EnvManager</span>
            </div>
            <div className="text-xs text-ctp-subtext0 font-body">
              © {new Date().getFullYear()} EnvManager. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
