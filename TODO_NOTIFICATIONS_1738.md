# TODO - Smart Notification Center with Priority Inbox (Issue #1738)

## Plan checklist

- [x] Inspect Prisma notification-related models + migrations (no notification models in Prisma; uses SQL tables via withDb/Supabase)

- [ ] Inspect existing repositories/services/routes/sockets for notifications
- [ ] Implement priority classification + scoring (urgent/high/medium/low)
- [x] Inspect notification DB schema: notifications table + rich fields (image/actions/data/critical) and preferences fields (sms/frequency/quiet hours/dnd)

- [ ] Implement deduplication by dedupeKey
- [ ] Implement snooze persistence + rescheduling
- [ ] Implement grouping (by event/type/sender) in notification retrieval
- [ ] Ensure preference enforcement (category toggles, channel control, quiet hours, DND, vacation mode)
- [ ] Ensure Priority tab + correct sorting/filtering
- [ ] Implement websocket real-time notification delivery
- [ ] Implement email digest scheduler (hourly/daily)
- [ ] Integrate FCM for mobile push (firebase-admin) into delivery pipeline
- [ ] Implement notification action buttons + server-side handlers
- [ ] Implement analytics (delivery/open/click/opt-out/best time heuristic)
- [ ] Build/upgrade UI notification center (tabs, search, bulk actions, expand groups)
- [ ] Add/adjust tests + QA scenarios
- [ ] Run lint/test/e2e and ensure merge-ready PR
