import React from "react"
import OwnerProfileClient from "@/components/owner/profile-client"
import OwnerProfileFallback from "@/components/owner/profile-fallback"
import { getUser } from "@/lib/server/auth"

export default async function OwnerProfilePage() {
  const user = await getUser()

  if (user) {
    // If server cookie is present and role is owner (or unspecified), render
    // We defensively check role here; if server reports a different role, show mismatch.
    const role = (user as any).role
    if (role && role !== "owner") {
      // redirect to role-mismatch page server-side
      // construct URL string — Next's redirect isn't imported here to avoid heavy runtime; instead render fallback which will handle redirect client-side.
      return <OwnerProfileFallback />
    }
    return <OwnerProfileClient initialUser={user} />
  }

  // No server cookie — render client fallback which reads localStorage
  return <OwnerProfileFallback />
}
