"use client";

import { FormEvent, useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/hooks/useToast";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import type { JournalEntry } from "@/lib/types";

type GroupedEntries = {
  dayKey: string;
  dayLabel: string;
  entries: JournalEntry[];
};

function moodTone(mood: JournalEntry["mood"]) {
  switch (mood) {
    case "Great":
      return "var(--green)";
    case "Good":
      return "var(--accent)";
    case "Bad":
      return "var(--red)";
    default:
      return "var(--gold)";
  }
}

export default function JournalDashboardPageClient({ userId }: { userId: string }) {
  const { entries, addEntry, deleteEntry } = useJournalEntries(userId);
  const { pushToast } = useToast();
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [showComposer, setShowComposer] = useState(false);
  const [readingEntry, setReadingEntry] = useState<JournalEntry | null>(null);

  const [title, setTitle] = useState("");
  const [mood, setMood] = useState<JournalEntry["mood"]>("Neutral");
  const [content, setContent] = useState("");

  const grouped = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? entries.filter((entry) =>
          `${entry.title} ${entry.content} ${entry.mood}`.toLowerCase().includes(query)
        )
      : entries;

    const bucket = new Map<string, GroupedEntries>();
    for (const entry of filtered) {
      const dayKey = entry.created_at.slice(0, 10);
      const date = new Date(`${dayKey}T00:00:00.000Z`);
      const dayLabel = date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
      });
      const existing = bucket.get(dayKey);
      if (existing) {
        existing.entries.push(entry);
      } else {
        bucket.set(dayKey, { dayKey, dayLabel, entries: [entry] });
      }
    }

    return Array.from(bucket.values()).sort((a, b) => (a.dayKey < b.dayKey ? 1 : -1));
  }, [entries, search]);

  const onComposerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await addEntry({
      title,
      content,
      mood
    });
    setShowComposer(false);
    setTitle("");
    setMood("Neutral");
    setContent("");
    pushToast("Journal entry saved.", "success");
  };

  return (
    <div className="stagger">
      <section className="nx-panel animate-fade-in-up">
        <div className="nx-between" style={{ marginBottom: "10px" }}>
          <div>
            <h2 className="nx-card-title">Journal Timeline</h2>
            <p className="nx-card-sub">Browse memories by day in a calm, searchable feed.</p>
          </div>
          <button className="nx-btn primary" type="button" onClick={() => setShowComposer(true)}>
            + Quick Entry
          </button>
        </div>

        <div className="nx-form-grid two" style={{ marginBottom: "10px" }}>
          <input
            className="nx-input"
            placeholder="Search entries, moods, themes..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div style={{ display: "grid", gap: "10px" }}>
          {grouped.map((day) => {
            const isCollapsed = collapsed[day.dayKey] ?? false;
            const dayMood = day.entries[0]?.mood ?? "Neutral";
            return (
              <article key={day.dayKey} className="nx-journal-day">
                <button
                  type="button"
                  className="nx-journal-day-header"
                  onClick={() =>
                    setCollapsed((prev) => ({ ...prev, [day.dayKey]: !isCollapsed }))
                  }
                >
                  <div>
                    <h3>{day.dayLabel}</h3>
                    <p>{day.entries.length} entr{day.entries.length === 1 ? "y" : "ies"}</p>
                  </div>
                  <span className="nx-badge" style={{ color: moodTone(dayMood) }}>
                    {dayMood}
                  </span>
                </button>

                {!isCollapsed ? (
                  <div style={{ display: "grid", gap: "8px", marginTop: "8px" }}>
                    {day.entries.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        className="nx-journal-entry-card"
                        onClick={() => setReadingEntry(entry)}
                      >
                        <div className="nx-between" style={{ marginBottom: "6px" }}>
                          <strong>{entry.title}</strong>
                          <span style={{ color: moodTone(entry.mood) }}>{entry.mood}</span>
                        </div>
                        <p>{entry.content.slice(0, 180)}{entry.content.length > 180 ? "…" : ""}</p>
                        <div className="nx-between" style={{ marginTop: "8px" }}>
                          <small>{new Date(entry.created_at).toLocaleTimeString()}</small>
                          <span className="nx-mini-link">Read mode</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <Modal
        open={showComposer}
        onClose={() => setShowComposer(false)}
        title="New Journal Entry"
        description="Capture thoughts in a focused writing flow."
        variant="fullscreen"
      >
        <form className="nx-form-grid" onSubmit={onComposerSubmit}>
          <input
            className="nx-input"
            placeholder="Entry title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <select
            className="nx-select"
            value={mood}
            onChange={(event) =>
              setMood(event.target.value as JournalEntry["mood"])
            }
          >
            <option value="Great">Great</option>
            <option value="Good">Good</option>
            <option value="Neutral">Neutral</option>
            <option value="Bad">Bad</option>
          </select>
          <textarea
            className="nx-textarea"
            placeholder="Write your entry..."
            style={{ minHeight: "42vh" }}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            required
          />
          <button className="nx-btn primary" type="submit">
            Save Entry
          </button>
        </form>
      </Modal>

      <Modal
        open={Boolean(readingEntry)}
        onClose={() => setReadingEntry(null)}
        title={readingEntry?.title ?? "Entry"}
        description={
          readingEntry
            ? `${new Date(readingEntry.created_at).toLocaleString()} · ${readingEntry.mood}`
            : undefined
        }
        variant="fullscreen"
        footer={
          readingEntry ? (
            <div className="nx-between" style={{ width: "100%" }}>
              <button
                type="button"
                className="nx-btn"
                onClick={async () => {
                  await deleteEntry(readingEntry.id);
                  setReadingEntry(null);
                  pushToast("Entry deleted.", "success");
                }}
              >
                Delete
              </button>
              <button type="button" className="nx-btn primary" onClick={() => setReadingEntry(null)}>
                Close
              </button>
            </div>
          ) : null
        }
      >
        {readingEntry ? (
          <article className="nx-reading-mode">
            <p>{readingEntry.content}</p>
          </article>
        ) : null}
      </Modal>
    </div>
  );
}
