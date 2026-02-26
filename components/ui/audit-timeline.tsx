import { formatDate } from "@/lib/format";
import { AuditEventData } from "@/types/api";
import { Activity, FileText } from "lucide-react";

interface AuditTimelineProps {
  events: AuditEventData[];
}

function toReadableAction(action: string): string {
  return action
    .replace(/\./g, " ")
    .replace(/_/g, " ")
    .split(" ")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

export function AuditTimeline({ events }: AuditTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="empty-state">
        <Activity size={28} />
        <span>No audit events yet.</span>
      </div>
    );
  }

  return (
    <ul className="audit-list">
      {events.map((event) => {
        const payload = Object.entries(event.payload)
          .map(([key, value]) => `${key}: ${String(value)}`)
          .join(" • ");

        return (
          <li key={event.id}>
            <div className="audit-dot" aria-hidden="true">
              <FileText size={13} />
            </div>
            <div className="audit-body">
              <p className="audit-title">{toReadableAction(event.action)}</p>
              <p className="audit-meta">
                by {event.actor_display} ({event.actor_type}) &middot; {formatDate(event.created_at)}
              </p>
              {payload ? <p className="audit-payload">{payload}</p> : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
