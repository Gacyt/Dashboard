"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/hooks/useToast";
import { useWorkoutWeekdays } from "@/hooks/useWorkoutWeekdays";
import { weekStartId } from "@/lib/getWeekDates";
import type { WorkoutProgressLog, WorkoutWeekdayExercise } from "@/lib/types";

const WEEKDAYS = [
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
  { value: 7, label: "Sunday", short: "Sun" }
];

function currentWeekday() {
  const day = new Date().getDay();
  return day === 0 ? 7 : day;
}

export default function GymPageClient({ userId }: { userId: string }) {
  const {
    weekdays,
    progressByExercise,
    saveWeekday,
    addExercise,
    updateExercise,
    deleteExercise,
    reorderExercises,
    saveProgress
  } = useWorkoutWeekdays(userId);
  const { pushToast } = useToast();

  const [selectedWeekday, setSelectedWeekday] = useState(currentWeekday());
  const [showDayModal, setShowDayModal] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [editExerciseId, setEditExerciseId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const dayConfig = useMemo(
    () => weekdays.find((day) => day.weekday === selectedWeekday) ?? null,
    [selectedWeekday, weekdays]
  );
  const exercises = useMemo(
    () => dayConfig?.workout_weekday_exercises ?? [],
    [dayConfig]
  );

  const [dayTitle, setDayTitle] = useState("");
  const [dayNotes, setDayNotes] = useState("");
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseSets, setExerciseSets] = useState("4");
  const [exerciseReps, setExerciseReps] = useState("8");
  const [exerciseNotes, setExerciseNotes] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = exercises.findIndex((exercise) => exercise.id === active.id);
    const newIndex = exercises.findIndex((exercise) => exercise.id === over.id);
    const next = arrayMove(exercises, oldIndex, newIndex);
    await reorderExercises(next.map((exercise, index) => ({ id: exercise.id, order_index: index })));
    pushToast("Exercise order updated.", "success");
  };

  const openDayModal = () => {
    setDayTitle(dayConfig?.title ?? "");
    setDayNotes(dayConfig?.notes ?? "");
    setShowDayModal(true);
  };

  const openAddExerciseModal = () => {
    setExerciseName("");
    setExerciseSets("4");
    setExerciseReps("8");
    setExerciseNotes("");
    setShowAddExercise(true);
  };

  const editingExercise = useMemo(
    () => exercises.find((exercise) => exercise.id === editExerciseId) ?? null,
    [editExerciseId, exercises]
  );

  const logsForExercise = (exerciseId: string) =>
    progressByExercise.get(exerciseId) ?? [];

  const onDaySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await saveWeekday({
      weekday: selectedWeekday,
      title: dayTitle.trim(),
      notes: dayNotes.trim()
    });
    setShowDayModal(false);
    pushToast("Workout day saved.", "success");
  };

  const onAddExerciseSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await addExercise({
      weekday: selectedWeekday,
      name: exerciseName.trim(),
      notes: exerciseNotes.trim(),
      target_sets: Number(exerciseSets),
      target_reps: Number(exerciseReps)
    });
    setShowAddExercise(false);
    pushToast("Exercise added.", "success");
  };

  const onEditExerciseSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingExercise) {
      return;
    }
    await updateExercise(editingExercise.id, {
      name: exerciseName.trim(),
      notes: exerciseNotes.trim() || null,
      target_sets: Number(exerciseSets),
      target_reps: Number(exerciseReps)
    });
    setEditExerciseId(null);
    pushToast("Exercise updated.", "success");
  };

  return (
    <div className="stagger">
      <section className="nx-panel animate-fade-in-up">
        <div className="nx-between" style={{ marginBottom: "12px" }}>
          <div>
            <h2 className="nx-card-title">Weekly Training Split</h2>
            <p className="nx-card-sub">Recurring weekday structure · week {weekStartId(new Date())}</p>
          </div>
          <button className="nx-btn" type="button" onClick={openDayModal}>
            Configure Day
          </button>
        </div>

        <div className="nx-week-strip">
          {WEEKDAYS.map((weekday) => {
            const weekdayPlan = weekdays.find((item) => item.weekday === weekday.value);
            const active = selectedWeekday === weekday.value;
            const tone = weekdayPlan ? "workout" : "rest";
            return (
              <button
                key={weekday.value}
                type="button"
                className={`nx-day-card ${tone} ${active ? "active" : ""}`}
                onClick={() => setSelectedWeekday(weekday.value)}
              >
                <p style={{ fontSize: "10px", color: "var(--txt2)" }}>{weekday.short}</p>
                <p className="nx-fin-val" style={{ lineHeight: 1 }}>
                  {weekday.label.slice(0, 3).toUpperCase()}
                </p>
                <p style={{ fontSize: "11px" }}>{weekdayPlan?.title ?? "Rest / Unplanned"}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="nx-panel">
        <div className="nx-between" style={{ marginBottom: "10px" }}>
          <div>
            <h2 className="nx-card-title">
              {WEEKDAYS.find((weekday) => weekday.value === selectedWeekday)?.label} — {dayConfig?.title ?? "Unconfigured"}
            </h2>
            <p className="nx-card-sub">{dayConfig?.notes ?? "Set your split and keep momentum."}</p>
          </div>
          <button className="nx-btn primary" type="button" onClick={openAddExerciseModal}>
            + Add Exercise
          </button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={exercises.map((exercise) => exercise.id)} strategy={verticalListSortingStrategy}>
            <div style={{ display: "grid", gap: "8px" }}>
              {exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  expanded={expandedId === exercise.id}
                  onToggleExpand={() => setExpandedId((current) => (current === exercise.id ? null : exercise.id))}
                  onEdit={() => {
                    setEditExerciseId(exercise.id);
                    setExerciseName(exercise.name);
                    setExerciseSets(String(exercise.target_sets));
                    setExerciseReps(String(exercise.target_reps));
                    setExerciseNotes(exercise.notes ?? "");
                  }}
                  onDelete={async () => {
                    await deleteExercise(exercise.id);
                    pushToast("Exercise removed.", "success");
                  }}
                  onComplete={async () => {
                    await saveProgress({
                      exerciseId: exercise.id,
                      performedOn: new Date().toISOString().slice(0, 10),
                      completed: true
                    });
                    pushToast("Exercise completed.", "success");
                  }}
                  logs={logsForExercise(exercise.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      <Modal
        open={showDayModal}
        onClose={() => setShowDayModal(false)}
        title={`Configure ${WEEKDAYS.find((weekday) => weekday.value === selectedWeekday)?.label}`}
        description="Define the recurring training intent for this weekday."
      >
        <form className="nx-form-grid" onSubmit={onDaySubmit}>
          <input className="nx-input" placeholder="Split name" value={dayTitle} onChange={(event) => setDayTitle(event.target.value)} required />
          <textarea className="nx-textarea" placeholder="Notes / focus cues" value={dayNotes} onChange={(event) => setDayNotes(event.target.value)} />
          <button className="nx-btn primary" type="submit">
            Save Day
          </button>
        </form>
      </Modal>

      <Modal
        open={showAddExercise}
        onClose={() => setShowAddExercise(false)}
        title="Add Exercise"
        description="Add a repeatable exercise block for this weekday."
      >
        <form className="nx-form-grid" onSubmit={onAddExerciseSubmit}>
          <input className="nx-input" placeholder="Exercise name" value={exerciseName} onChange={(event) => setExerciseName(event.target.value)} required />
          <div className="nx-form-grid two">
            <input className="nx-input" type="number" min="1" value={exerciseSets} onChange={(event) => setExerciseSets(event.target.value)} required />
            <input className="nx-input" type="number" min="1" value={exerciseReps} onChange={(event) => setExerciseReps(event.target.value)} required />
          </div>
          <textarea className="nx-textarea" placeholder="Execution notes" value={exerciseNotes} onChange={(event) => setExerciseNotes(event.target.value)} />
          <button className="nx-btn primary" type="submit">
            Add Exercise
          </button>
        </form>
      </Modal>

      <Modal
        open={Boolean(editingExercise)}
        onClose={() => setEditExerciseId(null)}
        title="Edit Exercise"
        description="Tune sets, reps, and coaching notes."
      >
        <form className="nx-form-grid" onSubmit={onEditExerciseSubmit}>
          <input className="nx-input" placeholder="Exercise name" value={exerciseName} onChange={(event) => setExerciseName(event.target.value)} required />
          <div className="nx-form-grid two">
            <input className="nx-input" type="number" min="1" value={exerciseSets} onChange={(event) => setExerciseSets(event.target.value)} required />
            <input className="nx-input" type="number" min="1" value={exerciseReps} onChange={(event) => setExerciseReps(event.target.value)} required />
          </div>
          <textarea className="nx-textarea" placeholder="Notes" value={exerciseNotes} onChange={(event) => setExerciseNotes(event.target.value)} />
          <button className="nx-btn primary" type="submit">
            Save Changes
          </button>
        </form>
      </Modal>
    </div>
  );
}

function ExerciseCard({
  exercise,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onComplete,
  logs
}: {
  exercise: WorkoutWeekdayExercise;
  expanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  onComplete: () => Promise<void>;
  logs: WorkoutProgressLog[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: exercise.id });
  const today = new Date().toISOString().slice(0, 10);
  const todayDone = logs.some((log) => log.performed_on === today && log.completed);
  const recentWeight = logs
    .slice(0, 6)
    .map((log) => Number(log.weight_kg ?? 0))
    .reverse();
  const maxWeight = Math.max(...recentWeight, 1);

  return (
    <article
      ref={setNodeRef}
      className="nx-panel"
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <div className="nx-between" style={{ gap: "8px", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button className="nx-btn" type="button" {...attributes} {...listeners} aria-label="Drag handle">
            ⋮⋮
          </button>
          <div style={{ width: "54px", height: "54px", borderRadius: "8px", background: "var(--bg4)", display: "grid", placeItems: "center" }}>
            <span
              style={{
                fontFamily: "var(--font-barlow-condensed), sans-serif",
                fontSize: "14px",
                letterSpacing: "0.06em",
                color: "var(--txt2)"
              }}
            >
              {exercise.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <strong>{exercise.name}</strong>
            <p className="nx-exp-cat">{exercise.target_sets} sets × {exercise.target_reps} reps</p>
            <p className="nx-exp-cat">{exercise.notes || "Tap to add cues and progression notes."}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button className={`nx-btn ${todayDone ? "primary" : ""}`} type="button" onClick={() => onComplete()}>
            {todayDone ? "Completed" : "Mark Done"}
          </button>
          <button className="nx-btn" type="button" onClick={onToggleExpand}>
            {expanded ? "Collapse" : "Details"}
          </button>
          <button className="nx-btn" type="button" onClick={onEdit}>
            Edit
          </button>
          <button className="nx-btn" type="button" onClick={() => onDelete()}>
            Delete
          </button>
        </div>
      </div>

      {expanded ? (
        <div style={{ marginTop: "10px", display: "grid", gap: "10px" }}>
          <div>
            <p className="nx-list-label">Weight Progression</p>
            <div className="nx-progress-bars">
              {recentWeight.length > 0 ? (
                recentWeight.map((weight, index) => (
                  <span
                    key={`${exercise.id}-${index}`}
                    style={{ height: `${Math.max((weight / maxWeight) * 100, 8)}%` }}
                    title={`${weight}kg`}
                  />
                ))
              ) : (
                <p className="nx-exp-cat">No progression logs yet.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
