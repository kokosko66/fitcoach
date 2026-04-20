"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AssignClient({ programId, availableClients }) {
  const [selectedClient, setSelectedClient] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleAssign() {
    if (!selectedClient) return;
    setLoading(true);

    await supabase.from("program_assignments").insert({
      program_id: programId,
      client_id: selectedClient,
    });

    setSelectedClient("");
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="mt-3 flex gap-2 items-center">
      <select
        value={selectedClient}
        onChange={(e) => setSelectedClient(e.target.value)}
        className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md text-sm dark:bg-gray-800 dark:text-white"
      >
        <option value="">Assign a client...</option>
        {availableClients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.full_name}
          </option>
        ))}
      </select>
      <button
        onClick={handleAssign}
        disabled={!selectedClient || loading}
        className="px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50"
      >
        Assign
      </button>
    </div>
  );
}
