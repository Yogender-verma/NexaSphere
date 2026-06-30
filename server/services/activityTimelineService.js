import { withDb } from '../repositories/db.js';
import { HAS_SUPABASE } from '../storage/supabaseClient.js';

export const activityTimelineService = {
  /**
   * Fetches the complete activity timeline for an individual user.
   * Due to system design, some activities are tied to email (events, forms)
   * while others are tied to username (portfolios, certificates).
   */
  async getUserTimeline({ email, username }) {
    if (!HAS_SUPABASE) return [];

    let events = [];

    await withDb(async (client) => {
      // 1. Events Attended
      if (email) {
        const registrationsRes = await client.query(
          `SELECT er.event_id, er.status, er.attended, er.attended_at, er.created_at, e.title 
           FROM event_registrations er
           LEFT JOIN events e ON er.event_id = e.id
           WHERE er.email = $1`,
          [email]
        );
        registrationsRes.rows.forEach((r) => {
          // Registration event
          events.push({
            id: `reg_${r.event_id}`,
            type: 'event_registration',
            title: `Registered for Event: ${r.title || r.event_id}`,
            description: `Status: ${r.status}`,
            timestamp: r.created_at,
            metadata: { eventId: r.event_id, status: r.status },
          });

          // Attendance event
          if (r.attended && r.attended_at) {
            events.push({
              id: `att_${r.event_id}`,
              type: 'event_attendance',
              title: `Attended Event: ${r.title || r.event_id}`,
              description: 'Successfully checked in.',
              timestamp: r.attended_at,
              metadata: { eventId: r.event_id },
            });
          }
        });
      }

      // 2. Form Submissions
      if (email) {
        const formsRes = await client.query(
          `SELECT id, form_type, created_at 
           FROM form_submissions 
           WHERE college_email = $1`,
          [email]
        );
        formsRes.rows.forEach((f) => {
          events.push({
            id: `form_${f.id}`,
            type: 'form_submission',
            title: `Submitted Form: ${f.form_type}`,
            description: 'Application submitted successfully.',
            timestamp: f.created_at,
            metadata: { formId: f.id, formType: f.form_type },
          });
        });
      }

      // 3. Certificates / Achievements Earned
      if (username) {
        const achievementsRes = await client.query(
          `SELECT id, name, description, tier, awarded_at 
           FROM portfolio_achievements 
           WHERE username = $1`,
          [username]
        );
        achievementsRes.rows.forEach((a) => {
          events.push({
            id: `cert_${a.id}`,
            type: 'certificate_earned',
            title: `Earned Certificate: ${a.name}`,
            description: `Tier: ${a.tier}. ${a.description || ''}`,
            timestamp: a.awarded_at,
            metadata: { certificateId: a.id, tier: a.tier },
          });
        });

        // 4. Portfolio Edits
        const portfolioRes = await client.query(
          `SELECT updated_at, created_at 
           FROM portfolios 
           WHERE username = $1`,
          [username]
        );
        if (portfolioRes.rows.length > 0) {
          const p = portfolioRes.rows[0];
          events.push({
            id: `port_create_${username}`,
            type: 'portfolio_created',
            title: 'Portfolio Created',
            description: `Portfolio registered for ${username}.`,
            timestamp: p.created_at,
            metadata: { username },
          });

          // If updated_at is significantly different from created_at, log an edit event
          if (
            p.updated_at &&
            new Date(p.updated_at).getTime() > new Date(p.created_at).getTime() + 1000
          ) {
            events.push({
              id: `port_edit_${username}`,
              type: 'portfolio_edited',
              title: 'Portfolio Updated',
              description: `Last saved edits for ${username}.`,
              timestamp: p.updated_at,
              metadata: { username },
            });
          }
        }
      }
    });

    // Sort globally by timestamp descending (newest first)
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return events;
  },
};
