"use client";

import { FormEvent, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import ModuleCard from "./ModuleCard";
import styles from "./modules.module.css";
import { JournalEntry } from "@/lib/types";

type JournalModuleProps = {
  journalEntries: JournalEntry[];
  onCreateEntry: (payload: {
    title: string;
    content: string;
    mood: "Great" | "Good" | "Neutral" | "Bad";
  }) => Promise<void>;
  onUpdateEntry: (
    entryId: string,
    payload: { title?: string; content?: string; mood?: "Great" | "Good" | "Neutral" | "Bad" }
  ) => Promise<void>;
  onDeleteEntry: (entryId: string) => Promise<void>;
};

const chartPalette = ["#EB0004", "#DFDFDF", "#767676", "#5135CD"];
const moodOptions = ["Great", "Good", "Neutral", "Bad"] as const;

export default function JournalModule({
  journalEntries,
  onCreateEntry,
  onUpdateEntry,
  onDeleteEntry
}: JournalModuleProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<"Great" | "Good" | "Neutral" | "Bad">("Neutral");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editMood, setEditMood] = useState<"Great" | "Good" | "Neutral" | "Bad">("Neutral");

  const moodData = useMemo(() => {
    const moodMap = new Map<string, number>();
    for (const entry of journalEntries) {
      moodMap.set(entry.mood, (moodMap.get(entry.mood) ?? 0) + 1);
    }
    return Array.from(moodMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
  }, [journalEntries]);

  const submitEntry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) {
      return;
    }
    await onCreateEntry({ title, content, mood });
    setTitle("");
    setContent("");
    setMood("Neutral");
  };

  const startEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setEditTitle(entry.title);
    setEditContent(entry.content);
    setEditMood(entry.mood);
  };

  const saveEdit = async (entryId: string) => {
    await onUpdateEntry(entryId, {
      title: editTitle,
      content: editContent,
      mood: editMood
    });
    setEditingId(null);
  };

  return (
    <ModuleCard title="Journal" subtitle="Mood and reflection">
      <form className={styles.formGrid} onSubmit={submitEntry}>
        <input
          className={styles.input}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Entry title"
          required
        />
        <textarea
          className={styles.textarea}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write your entry"
          required
        />
        <select
          className={styles.select}
          value={mood}
          onChange={(event) =>
            setMood(event.target.value as "Great" | "Good" | "Neutral" | "Bad")
          }
        >
          {moodOptions.map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>
        <button className={styles.actionButton} type="submit">
          Add Entry
        </button>
      </form>

      {moodData.length > 0 ? (
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={moodData} dataKey="value" nameKey="name" innerRadius={34} outerRadius={60}>
                {moodData.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={chartPalette[index % chartPalette.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#000",
                  border: "1px solid #767676",
                  color: "#dfdfdf"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className={styles.empty}>No entries yet.</p>
      )}

      <ul className={styles.list}>
        {journalEntries.slice(0, 3).map((entry) => (
          <li className={styles.listItem} key={entry.id}>
            {editingId === entry.id ? (
              <div className={styles.flexGrow}>
                <div className={styles.formGrid}>
                  <input
                    className={styles.input}
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                  />
                  <textarea
                    className={styles.textarea}
                    value={editContent}
                    onChange={(event) => setEditContent(event.target.value)}
                  />
                  <select
                    className={styles.select}
                    value={editMood}
                    onChange={(event) =>
                      setEditMood(
                        event.target.value as "Great" | "Good" | "Neutral" | "Bad"
                      )
                    }
                  >
                    {moodOptions.map((item) => (
                      <option value={item} key={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <div className={styles.buttonRow}>
                    <button
                      type="button"
                      className={styles.actionButton}
                      onClick={() => saveEdit(entry.id)}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className={styles.actionButton}
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.flexGrow}>
                  <p>{entry.title}</p>
                  <p>
                    {entry.content.slice(0, 60)}
                    {entry.content.length > 60 ? "..." : ""}
                  </p>
                  <p className={styles.muted}>
                    {entry.mood} · {new Date(entry.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className={styles.buttonColumn}>
                  <button
                    type="button"
                    className={styles.checkButton}
                    onClick={() => startEdit(entry)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={styles.checkButton}
                    onClick={() => onDeleteEntry(entry.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </ModuleCard>
  );
}

