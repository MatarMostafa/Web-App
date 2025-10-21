"use client";

import { useSession } from "next-auth/react";

export default function SessionDebug() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading session...</div>;

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Session Debug:</h3>
      <p><strong>Status:</strong> {status}</p>
      <p><strong>User:</strong> {session?.user?.email}</p>
      <p><strong>Role:</strong> {session?.user?.role}</p>
      <p><strong>Access Token:</strong> {session?.accessToken ? "Present" : "Missing"}</p>
      <p><strong>Token Preview:</strong> {session?.accessToken?.substring(0, 50)}...</p>
      <details className="mt-2">
        <summary>Full Session Data</summary>
        <pre className="text-xs mt-2 bg-white p-2 rounded">
          {JSON.stringify(session, null, 2)}
        </pre>
      </details>
    </div>
  );
}