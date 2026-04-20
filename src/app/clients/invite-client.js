"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function InviteClient({ coachId }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleInvite(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    setMessage(
      "To connect with a client: have them sign up as a 'Client' on FitCoach, then share their email with you. We'll add a proper invite link flow soon."
    );
    setLoading(false);
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg p-4">
      <h2 className="text-sm font-bold dark:text-white mb-2">Add a client</h2>
      <form onSubmit={handleInvite} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Client's email address"
          required
          className="flex-1 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md text-sm dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50"
        >
          {loading ? "..." : "Add"}
        </button>
      </form>
      {message && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>
      )}
    </div>
  );
}
