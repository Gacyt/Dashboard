"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/hooks/useToast";
import {
  CreateKind,
  NX_CREATE_HUB_OPEN_EVENT,
  emitCreateHubCreated
} from "@/lib/createHub";

type CreateAction = {
  kind: CreateKind;
  label: string;
  subtitle: string;
  icon: "expense" | "task" | "habit" | "journal" | "workout-day" | "exercise";
  keywords: string;
};

const ACTIONS: CreateAction[] = [
  {
    kind: "expense",
    label: "Add Expense",
    subtitle: "Capture spending quickly",
    icon: "expense",
    keywords: "money finance payment spend purchase"
  },
  {
    kind: "task",
    label: "Add Task",
    subtitle: "Create a next action",
    icon: "task",
    keywords: "todo work action reminder"
  },
  {
    kind: "habit",
    label: "Add Habit",
    subtitle: "Build consistency",
    icon: "habit",
    keywords: "routine repeat streak"
  },
  {
    kind: "journal",
    label: "Add Journal Entry",
    subtitle: "Reflect in flow",
    icon: "journal",
    keywords: "write memory note mood"
  },
  {
    kind: "workout-day",
    label: "Add Workout Day",
    subtitle: "Plan recurring split",
    icon: "workout-day",
    keywords: "training split monday tuesday weekday"
  },
  {
    kind: "exercise",
    label: "Add Exercise",
    subtitle: "Attach to weekday split",
    icon: "exercise",
    keywords: "sets reps gym lift"
  }
];

const WEEKDAYS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" }
];

async function requestJson(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Request failed");
  }
  return payload;
}

function CreateIcon({ icon }: { icon: CreateAction["icon"] }) {
  if (icon === "expense") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3.5" y="6" width="17" height="12" rx="3" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3.5 11h17" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  if (icon === "task") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 7h8M5 12h8M5 17h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M16 12l2 2 3-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (icon === "habit") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="8" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8.5 12.5l2.3 2.3L15.5 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (icon === "journal") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 4.8h8.5a2.5 2.5 0 0 1 2.5 2.5V19.2H8.5A2.5 2.5 0 0 0 6 21.7V4.8Z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8.7 9h5.8M8.7 12h5.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === "workout-day") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 11.2h16M7 8v6.4M17 8v6.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <rect x="2.8" y="9.4" width="3.2" height="3.6" rx="0.8" stroke="currentColor" strokeWidth="1.5" />
        <rect x="18" y="9.4" width="3.2" height="3.6" rx="0.8" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="12" r="8.6" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

export default function FloatingCreateHub() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [hubOpen, setHubOpen] = useState(false);
  const [active, setActive] = useState<CreateKind | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [query, setQuery] = useState("");

  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("other");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseType, setExpenseType] = useState<"normal" | "extraordinary">("normal");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");

  const [habitName, setHabitName] = useState("");
  const [habitTarget, setHabitTarget] = useState("1");

  const [journalTitle, setJournalTitle] = useState("");
  const [journalMood, setJournalMood] = useState<"Great" | "Good" | "Neutral" | "Bad">("Neutral");
  const [journalContent, setJournalContent] = useState("");

  const [workoutWeekday, setWorkoutWeekday] = useState("1");
  const [workoutTitle, setWorkoutTitle] = useState("");
  const [workoutNotes, setWorkoutNotes] = useState("");

  const [exerciseWeekday, setExerciseWeekday] = useState("1");
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseSets, setExerciseSets] = useState("4");
  const [exerciseReps, setExerciseReps] = useState("8");
  const [exerciseNotes, setExerciseNotes] = useState("");

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<{ kind?: CreateKind | null }>).detail;
      if (detail?.kind) {
        setActive(detail.kind);
        setHubOpen(false);
      } else {
        setHubOpen(true);
        setActive(null);
      }
    };

    const onKeyboardOpen = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setHubOpen(true);
        setActive(null);
      }
    };

    window.addEventListener(NX_CREATE_HUB_OPEN_EVENT, onOpen as EventListener);
    window.addEventListener("keydown", onKeyboardOpen);

    return () => {
      window.removeEventListener(NX_CREATE_HUB_OPEN_EVENT, onOpen as EventListener);
      window.removeEventListener("keydown", onKeyboardOpen);
    };
  }, []);

  const filteredActions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return ACTIONS;
    }
    return ACTIONS.filter((action) => {
      const haystack = `${action.label} ${action.subtitle} ${action.keywords}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  const activeAction = useMemo(
    () => ACTIONS.find((action) => action.kind === active) ?? null,
    [active]
  );

  const closeAll = () => {
    setHubOpen(false);
    setActive(null);
    setQuery("");
  };

  const completeAndRefresh = (kind: CreateKind, message: string) => {
    emitCreateHubCreated(kind);
    pushToast(message, "success");
    closeAll();
    router.refresh();
  };

  const onExpenseSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await requestJson("/api/dashboard/expenses", {
        method: "POST",
        body: JSON.stringify({
          amount: Number(expenseAmount),
          category: expenseCategory,
          description: expenseDescription,
          expense_type: expenseType,
          date: expenseDate
        })
      });
      completeAndRefresh("expense", "Expense added.");
      setExpenseAmount("");
      setExpenseDescription("");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Unable to add expense.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onTaskSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await requestJson("/api/dashboard/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription,
          due_date: taskDueDate || null
        })
      });
      completeAndRefresh("task", "Task created.");
      setTaskTitle("");
      setTaskDescription("");
      setTaskDueDate("");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Unable to create task.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onHabitSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await requestJson("/api/dashboard/habits", {
        method: "POST",
        body: JSON.stringify({
          name: habitName,
          target_per_day: Number(habitTarget)
        })
      });
      completeAndRefresh("habit", "Habit added.");
      setHabitName("");
      setHabitTarget("1");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Unable to add habit.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onJournalSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await requestJson("/api/dashboard/journal", {
        method: "POST",
        body: JSON.stringify({
          title: journalTitle,
          mood: journalMood,
          content: journalContent
        })
      });
      completeAndRefresh("journal", "Journal entry saved.");
      setJournalTitle("");
      setJournalMood("Neutral");
      setJournalContent("");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Unable to add entry.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onWorkoutDaySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await requestJson("/api/dashboard/workout-weekdays", {
        method: "POST",
        body: JSON.stringify({
          weekday: Number(workoutWeekday),
          title: workoutTitle,
          notes: workoutNotes
        })
      });
      completeAndRefresh("workout-day", "Workout day configured.");
      setWorkoutTitle("");
      setWorkoutNotes("");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Unable to save workout day.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onExerciseSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await requestJson("/api/dashboard/workout-exercises", {
        method: "POST",
        body: JSON.stringify({
          weekday: Number(exerciseWeekday),
          name: exerciseName,
          target_sets: Number(exerciseSets),
          target_reps: Number(exerciseReps),
          notes: exerciseNotes
        })
      });
      completeAndRefresh("exercise", "Exercise added to split.");
      setExerciseName("");
      setExerciseSets("4");
      setExerciseReps("8");
      setExerciseNotes("");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Unable to add exercise.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="nx-fab"
        aria-label="Open creation hub"
        onClick={() => {
          setHubOpen(true);
          setActive(null);
        }}
      >
        <span aria-hidden>+</span>
      </button>

      <Modal
        open={hubOpen}
        onClose={closeAll}
        title="Create"
        description="Choose what you want to capture. Tip: Cmd/Ctrl + K opens this instantly."
        variant="sheet"
      >
        <div className="nx-create-search-wrap">
          <input
            className="nx-input"
            placeholder="Search actions..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search create actions"
          />
        </div>

        <div className="nx-create-grid">
          {filteredActions.map((action) => (
            <button
              key={action.kind}
              type="button"
              className="nx-create-item"
              onClick={() => setActive(action.kind)}
            >
              <span className="nx-create-icon">
                <CreateIcon icon={action.icon} />
              </span>
              <span>
                <strong>{action.label}</strong>
                <small>{action.subtitle}</small>
              </span>
            </button>
          ))}
        </div>
      </Modal>

      <Modal
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title={activeAction?.label ?? "Create"}
        description={activeAction?.subtitle}
        variant="dialog"
      >
        {active === "expense" ? (
          <form className="nx-form-grid" onSubmit={onExpenseSubmit}>
            <input className="nx-input" type="number" min="0.01" step="0.01" placeholder="Amount" value={expenseAmount} onChange={(event) => setExpenseAmount(event.target.value)} required aria-label="Expense amount" />
            <input className="nx-input" placeholder="Category" value={expenseCategory} onChange={(event) => setExpenseCategory(event.target.value)} aria-label="Expense category" />
            <input className="nx-input" type="date" value={expenseDate} onChange={(event) => setExpenseDate(event.target.value)} required aria-label="Expense date" />
            <select className="nx-select" value={expenseType} onChange={(event) => setExpenseType(event.target.value as "normal" | "extraordinary")} aria-label="Expense type">
              <option value="normal">normal</option>
              <option value="extraordinary">extraordinary</option>
            </select>
            <textarea className="nx-textarea" placeholder="Description" value={expenseDescription} onChange={(event) => setExpenseDescription(event.target.value)} aria-label="Expense description" />
            <button className="nx-btn primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Expense"}
            </button>
          </form>
        ) : null}

        {active === "task" ? (
          <form className="nx-form-grid" onSubmit={onTaskSubmit}>
            <input className="nx-input" placeholder="Task title" value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} required aria-label="Task title" />
            <textarea className="nx-textarea" placeholder="Description" value={taskDescription} onChange={(event) => setTaskDescription(event.target.value)} aria-label="Task description" />
            <input className="nx-input" type="date" value={taskDueDate} onChange={(event) => setTaskDueDate(event.target.value)} aria-label="Task due date" />
            <button className="nx-btn primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Create Task"}
            </button>
          </form>
        ) : null}

        {active === "habit" ? (
          <form className="nx-form-grid" onSubmit={onHabitSubmit}>
            <input className="nx-input" placeholder="Habit name" value={habitName} onChange={(event) => setHabitName(event.target.value)} required aria-label="Habit name" />
            <input className="nx-input" type="number" min="1" value={habitTarget} onChange={(event) => setHabitTarget(event.target.value)} required aria-label="Habit target per day" />
            <button className="nx-btn primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Create Habit"}
            </button>
          </form>
        ) : null}

        {active === "journal" ? (
          <form className="nx-form-grid" onSubmit={onJournalSubmit}>
            <input className="nx-input" placeholder="Entry title" value={journalTitle} onChange={(event) => setJournalTitle(event.target.value)} required aria-label="Journal entry title" />
            <select className="nx-select" value={journalMood} onChange={(event) => setJournalMood(event.target.value as "Great" | "Good" | "Neutral" | "Bad")} aria-label="Journal mood">
              <option value="Great">Great</option>
              <option value="Good">Good</option>
              <option value="Neutral">Neutral</option>
              <option value="Bad">Bad</option>
            </select>
            <textarea className="nx-textarea" placeholder="Write your entry..." value={journalContent} onChange={(event) => setJournalContent(event.target.value)} required aria-label="Journal content" />
            <button className="nx-btn primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Entry"}
            </button>
          </form>
        ) : null}

        {active === "workout-day" ? (
          <form className="nx-form-grid" onSubmit={onWorkoutDaySubmit}>
            <select className="nx-select" value={workoutWeekday} onChange={(event) => setWorkoutWeekday(event.target.value)} aria-label="Workout weekday">
              {WEEKDAYS.map((weekday) => (
                <option key={weekday.value} value={weekday.value}>
                  {weekday.label}
                </option>
              ))}
            </select>
            <input className="nx-input" placeholder="Split name (e.g. Back Day)" value={workoutTitle} onChange={(event) => setWorkoutTitle(event.target.value)} required aria-label="Workout day title" />
            <textarea className="nx-textarea" placeholder="Notes" value={workoutNotes} onChange={(event) => setWorkoutNotes(event.target.value)} aria-label="Workout day notes" />
            <button className="nx-btn primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Workout Day"}
            </button>
          </form>
        ) : null}

        {active === "exercise" ? (
          <form className="nx-form-grid" onSubmit={onExerciseSubmit}>
            <select className="nx-select" value={exerciseWeekday} onChange={(event) => setExerciseWeekday(event.target.value)} aria-label="Exercise weekday">
              {WEEKDAYS.map((weekday) => (
                <option key={weekday.value} value={weekday.value}>
                  {weekday.label}
                </option>
              ))}
            </select>
            <input className="nx-input" placeholder="Exercise name" value={exerciseName} onChange={(event) => setExerciseName(event.target.value)} required aria-label="Exercise name" />
            <div className="nx-form-grid two">
              <input className="nx-input" type="number" min="1" value={exerciseSets} onChange={(event) => setExerciseSets(event.target.value)} required aria-label="Target sets" />
              <input className="nx-input" type="number" min="1" value={exerciseReps} onChange={(event) => setExerciseReps(event.target.value)} required aria-label="Target reps" />
            </div>
            <textarea className="nx-textarea" placeholder="Notes" value={exerciseNotes} onChange={(event) => setExerciseNotes(event.target.value)} aria-label="Exercise notes" />
            <button className="nx-btn primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add Exercise"}
            </button>
          </form>
        ) : null}
      </Modal>
    </>
  );
}
