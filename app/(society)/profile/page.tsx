import React from "react"
import ProfileClient from "@/components/society/profile-client"
import ProfileFallback from "@/components/society/profile-fallback"
import { getUser } from "@/lib/server/auth"

export default async function ProfilePage() {
  const user = await getUser()

  // If we have a server-side cookie user, render immediately with server data.
  if (user) {
    return <ProfileClient initialUser={user} />
  }

  // Otherwise render a client-side fallback which reads localStorage and
  // either shows the profile or redirects to login. This prevents an
  // immediate server-side redirect when the login flow still uses localStorage.
  return <ProfileFallback />
}
