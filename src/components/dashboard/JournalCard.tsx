"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import { JournalEntry } from "@/lib/types";

export default function JournalCard({
  entries,
  onAddEntry
}: {
  entries: JournalEntry[];
  onAddEntry: (content: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState("");

  return (
    <Card title="JOURNAL" subtitle="Latest entries" action={<button className="nx-card-action">All entries</button>}>
      <div className="nx-journal-body">
        {entries.length > 0 ? (
          <div className="nx-journal-entry">
            <p className="nx-journal-date">{new Date(entries[0].created_at).toLocaleDateString()}</p>
            <p className="nx-journal-text">&quot;{entries[0].content}&quot;</p>
          </div>
        ) : (
          <div className="nx-journal-entry">
            <p className="nx-journal-date">No entries yet</p>
            <p className="nx-journal-text">
              &quot;Capture today&apos;s reflection to build consistency.&quot;
            </p>
          </div>
        )}

        <textarea
          className="nx-journal-input"
          placeholder="Write today's entry..."
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button
          className="nx-new-entry-btn"
          type="button"
          onClick={async () => {
            if (!draft.trim()) return;
            await onAddEntry(draft.trim());
            setDraft("");
          }}
        >
          ✎ Write Today&apos;s Entry
        </button>
      </div>
    </Card>
  );
}
