## Description

This PR introduces a comprehensive **User Activity Timeline** resolving Issue #1574. It allows administrators to see a full chronological history of a user's interactions across the platform. 

Changes include:
- **Timeline Service**: Created `activityTimelineService.js` which aggregates data from `event_registrations`, `form_submissions`, `portfolios`, and `portfolio_achievements`.
- **API Endpoints**: 
  - `GET /api/admin/users/timeline` - Provides unified timeline JSON
  - `GET /api/admin/users/timeline/export` - Downloads the timeline securely as a CSV
- **Admin UI**:
  - Inserted an `Activity` action button into the `UserManager.jsx` table.
  - Developed the `UserTimelineModal.jsx` component that displays the timeline chronologically and provides an input to correlate a portfolio `username` manually if needed.

Fixes #1574

## Type of change

- [x] New feature (non-breaking change which adds functionality)

## How Has This Been Tested?

- Tested SQL aggregation queries locally for accuracy against `student_users` and `portfolios`.
- Verified the modal correctly groups and sorts all events by timestamp.
- Downloaded the exported CSV report and validated headers/row mapping.

## Checklist:

- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my own code
- [x] I have commented my code, particularly in hard-to-understand areas
- [x] My changes generate no new warnings
- [x] Any dependent changes have been merged and published in downstream modules
