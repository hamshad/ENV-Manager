"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { Plus, Book, Calendar, Users, LogOut } from "lucide-react"
import Link from "next/link"

interface Repository {
  id: string
  name: string
  github_url: string
  description: string | null
  created_at: string
}

interface Activity {
  id: string
  action: string
  description: string | null
  created_at: string
  repository_id: string | null
}

interface Profile {
  username: string | null
  full_name: string | null
  avatar_url: string | null
  github_username: string | null
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
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

      // Get profile
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (profileData) {
        setProfile(profileData)
      }

      // Get repositories
      const { data: reposData } = await supabase
        .from("repositories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (reposData) {
        setRepositories(reposData)
      }

      // Get activities
      const { data: activitiesData } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (activitiesData) {
        setActivities(activitiesData)
      }

      setLoading(false)
    }

    getUser()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ctp-base flex items-center justify-center">
        <div className="text-ctp-text font-body">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ctp-base">
      {/* Header */}
      <header className="border-b border-ctp-surface1 bg-ctp-mantle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="text-xl font-heading font-bold text-ctp-text">EnvManager</div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/add-environment"
                className="flex items-center gap-2 px-4 py-2 btn-primary rounded-lg font-body font-medium"
              >
                <Plus className="w-4 h-4" />
                New
              </Link>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 btn-secondary rounded-lg font-body font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-ctp-surface1 rounded-full flex items-center justify-center mb-4">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url || "/placeholder.svg"}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full"
                    />
                  ) : (
                    <Users className="w-12 h-12 text-ctp-overlay1" />
                  )}
                </div>

                <h1 className="text-xl font-heading font-bold text-ctp-text mb-1">
                  {profile?.full_name || profile?.username || "User"}
                </h1>

                <p className="text-ctp-subtext1 font-body mb-4">@{profile?.username || "username"}</p>

                <div className="flex items-center gap-4 text-sm text-ctp-subtext1 font-body">
                  <div className="flex items-center gap-1">
                    <Book className="w-4 h-4" />
                    {repositories.length} repos
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Repositories Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-semibold text-ctp-text">Environment Repositories</h2>
              </div>

              {repositories.length === 0 ? (
                <div className="card p-8 text-center">
                  <Book className="w-12 h-12 text-ctp-overlay1 mx-auto mb-4" />
                  <h3 className="text-lg font-heading font-semibold text-ctp-text mb-2">No repositories yet</h3>
                  <p className="text-ctp-subtext1 font-body mb-4">
                    Add your first repository to start managing environment variables
                  </p>
                  <Link
                    href="/add-environment"
                    className="inline-flex items-center gap-2 px-4 py-2 btn-primary rounded-lg font-body font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Repository
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {repositories.map((repo) => (
                    <div key={repo.id} className="card p-6 hover:border-ctp-blue cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Book className="w-5 h-5 text-ctp-blue" />
                          <h3 className="font-heading font-semibold text-ctp-text">{repo.name}</h3>
                        </div>
                      </div>

                      {repo.description && (
                        <p className="text-ctp-subtext1 font-body text-sm mb-3">{repo.description}</p>
                      )}

                      <div className="flex items-center justify-between text-xs text-ctp-subtext0 font-body">
                        <a
                          href={repo.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ctp-blue hover:underline"
                        >
                          View on GitHub
                        </a>
                        <span>{new Date(repo.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Section */}
            <div>
              <h2 className="text-xl font-heading font-semibold text-ctp-text mb-6">Recent Activity</h2>

              {activities.length === 0 ? (
                <div className="card p-8 text-center">
                  <Calendar className="w-12 h-12 text-ctp-overlay1 mx-auto mb-4" />
                  <h3 className="text-lg font-heading font-semibold text-ctp-text mb-2">No activity yet</h3>
                  <p className="text-ctp-subtext1 font-body">Your recent actions will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <p className="text-ctp-text font-body">
                            <span className="font-medium">{activity.action}</span>
                            {activity.description && (
                              <span className="text-ctp-subtext1"> - {activity.description}</span>
                            )}
                          </p>
                          <p className="text-xs text-ctp-subtext0 font-body mt-1">
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
