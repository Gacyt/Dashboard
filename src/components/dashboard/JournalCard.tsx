"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import { JournalEntry } from "@/lib/types";
import { openCreateHub } from "@/lib/createHub";

export default function JournalCard({
  entries
}: {
  entries: JournalEntry[];
}) {
  return (
    <Card
      title="Journal"
      subtitle="Latest entries"
      action={
        <button className="nx-card-action" type="button" onClick={() => openCreateHub("journal")}>
          New Entry
        </button>
      }
    >
      <div className="nx-journal-body">
        {entries.length > 0 ? (
          <div className="nx-journal-entry">
            <p className="nx-journal-date">{new Date(entries[0].created_at).toLocaleDateString()}</p>
            <p className="nx-journal-text">
              &quot;{entries[0].content.slice(0, 220)}
              {entries[0].content.length > 220 ? "…" : ""}&quot;
            </p>
          </div>
        ) : (
          <div className="nx-journal-entry">
            <p className="nx-journal-date">No entries yet</p>
            <p className="nx-journal-text">
              &quot;Capture today&apos;s reflection to build consistency.&quot;
            </p>
          </div>
        )}
        <div className="nx-journal-actions">
          <button className="nx-btn primary" type="button" onClick={() => openCreateHub("journal")}>
            Capture Today
          </button>
          <Link className="nx-btn" href="/dashboard/journal">
            Open Timeline
          </Link>
        </div>
      </div>
    </Card>
  );
}
