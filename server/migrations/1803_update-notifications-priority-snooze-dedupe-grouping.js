/* Migration: Update notifications with priority, snooze, dedupe, and grouping fields
   Date: 2026-06-29
*/

export const up = (pgm) => {
  // Priority
  pgm.addColumn('notifications', {
    priority_class: { type: 'varchar(20)', notNull: true, default: 'low' },
    priority_score: { type: 'integer', notNull: true, default: 0 },
  });

  // Deduplication
  pgm.addColumn('notifications', {
    dedupe_key: { type: 'text' },
  });

  // Snoozing
  pgm.addColumn('notifications', {
    snoozed_until: { type: 'timestamptz' },
  });

  // Grouping metadata (minimal persistence; UI can group by these)
  pgm.addColumn('notifications', {
    group_type: { type: 'varchar(30)', notNull: true, default: 'none' }, // event/type/sender
    group_key: { type: 'text' }, // stable key per group
    sender: { type: 'text' },
    event_id: { type: 'text' },
  });

  // Archive
  pgm.addColumn('notifications', {
    archived_at: { type: 'timestamptz' },
  });

  // Indexes: keep them simple and compatible with the project's migration runner
  pgm.createIndex('notifications', 'user_id');
  pgm.createIndex('notifications', 'priority_score');
  pgm.createIndex('notifications', 'snoozed_until');
  pgm.createIndex('notifications', 'dedupe_key');
};

export const down = (pgm) => {
  pgm.dropColumn('notifications', 'priority_class');
  pgm.dropColumn('notifications', 'priority_score');
  pgm.dropColumn('notifications', 'dedupe_key');
  pgm.dropColumn('notifications', 'snoozed_until');
  pgm.dropColumn('notifications', 'group_type');
  pgm.dropColumn('notifications', 'group_key');
  pgm.dropColumn('notifications', 'sender');
  pgm.dropColumn('notifications', 'event_id');
  pgm.dropColumn('notifications', 'archived_at');
};
