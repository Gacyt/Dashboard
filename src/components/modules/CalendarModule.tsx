import ModuleCard from "./ModuleCard";
import styles from "./modules.module.css";
import { EventItem } from "@/lib/types";

type CalendarModuleProps = {
  events: EventItem[];
};

export default function CalendarModule({ events }: CalendarModuleProps) {
  return (
    <ModuleCard title="Calendar" subtitle="Upcoming events">
      {events.length === 0 ? (
        <p className={styles.empty}>No events scheduled.</p>
      ) : (
        <ul className={styles.list}>
          {events.slice(0, 5).map((event) => (
            <li key={event.id} className={styles.listItem}>
              <div>
                <p>{event.title}</p>
                <p className={styles.muted}>
                  {new Date(event.start_time).toLocaleString()} -{" "}
                  {new Date(event.end_time).toLocaleTimeString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </ModuleCard>
  );
}

