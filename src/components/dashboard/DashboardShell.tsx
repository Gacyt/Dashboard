"use client";

import styles from "./dashboard.module.css";
import moduleStyles from "@/components/modules/modules.module.css";
import LogoutButton from "./LogoutButton";
import FinanceModule from "@/components/modules/FinanceModule";
import TasksModule from "@/components/modules/TasksModule";
import CalendarModule from "@/components/modules/CalendarModule";
import HabitsModule from "@/components/modules/HabitsModule";
import FitnessModule from "@/components/modules/FitnessModule";
import JournalModule from "@/components/modules/JournalModule";
import { useLocalProgress } from "@/hooks/useLocalProgress";
import { DashboardData } from "@/lib/types";

type DashboardShellProps = {
  userEmail: string;
  data: DashboardData;
};

export default function DashboardShell({ userEmail, data }: DashboardShellProps) {
  const { tasks, habits, toggleTask, toggleHabit, taskCompletion, habitCompletion } =
    useLocalProgress(data.tasks, data.habits);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandWrap}>
          <span className={styles.brandDot} aria-hidden />
          <p className={styles.brand}>
            Nexus
            <br />
            [LifeOS]
          </p>
        </div>

        <div className={styles.headerActions}>
          <p className={styles.email}>{userEmail}</p>
          <LogoutButton />
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <p className={styles.sidebarTitle}>Modules</p>
          <nav className={styles.sidebarNav}>
            <a className={styles.sidebarLink} href="#finance">
              Finance
            </a>
            <a className={styles.sidebarLink} href="#tasks">
              Tasks
            </a>
            <a className={styles.sidebarLink} href="#calendar">
              Calendar
            </a>
            <a className={styles.sidebarLink} href="#habits">
              Habits
            </a>
            <a className={styles.sidebarLink} href="#fitness">
              Fitness
            </a>
            <a className={styles.sidebarLink} href="#journal">
              Journal
            </a>
          </nav>
        </aside>

        <main className={styles.main}>
          <section className={styles.overviewGrid}>
            <article className={styles.overviewCard}>
              <p className={styles.overviewLabel}>Tasks completed</p>
              <p className={styles.overviewValue}>{taskCompletion}%</p>
            </article>
            <article className={styles.overviewCard}>
              <p className={styles.overviewLabel}>Habit consistency</p>
              <p className={styles.overviewValue}>{habitCompletion}%</p>
            </article>
            <article className={styles.overviewCard}>
              <p className={styles.overviewLabel}>Upcoming events</p>
              <p className={styles.overviewValue}>{data.events.length}</p>
            </article>
            <article className={styles.overviewCard}>
              <p className={styles.overviewLabel}>Journal entries</p>
              <p className={styles.overviewValue}>{data.journalEntries.length}</p>
            </article>
          </section>

          <section className={styles.moduleGrid}>
            <div id="finance" className={moduleStyles.anchor}>
              <FinanceModule expenses={data.expenses} budget={data.budget} />
            </div>
            <div id="tasks" className={moduleStyles.anchor}>
              <TasksModule tasks={tasks} onToggleTask={toggleTask} />
            </div>
            <div id="calendar" className={moduleStyles.anchor}>
              <CalendarModule events={data.events} />
            </div>
            <div id="habits" className={moduleStyles.anchor}>
              <HabitsModule habits={habits} onToggleHabit={toggleHabit} />
            </div>
            <div id="fitness" className={moduleStyles.anchor}>
              <FitnessModule workouts={data.workouts} bodyMetrics={data.bodyMetrics} />
            </div>
            <div id="journal" className={moduleStyles.anchor}>
              <JournalModule journalEntries={data.journalEntries} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

