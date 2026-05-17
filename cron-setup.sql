-- ══════════════════════════════════════════════════════════════
-- Zuhause App — Cron-Jobs für Push-Notifications
-- ══════════════════════════════════════════════════════════════
--
-- VORAUSSETZUNG:
--   1. Supabase Dashboard → Database → Extensions → pg_cron aktivieren
--   2. Supabase Dashboard → Database → Extensions → pg_net  aktivieren
--   3. Danach dieses SQL im SQL-Editor ausführen
--
-- Edge Functions müssen deployed sein:
--   • push-daily-tasks
--   • push-calendar-reminder
--   • push-weekly-overview
-- ══════════════════════════════════════════════════════════════

-- ☀️ Tägliche Aufgaben-Erinnerung — Mo bis Fr, 8:00 Uhr (UTC = 6:00 Uhr MEZ / 7:00 Uhr MESZ)
SELECT cron.schedule(
  'push-daily-tasks',
  '0 6 * * 1-5',
  $$
    SELECT net.http_post(
      url     := 'https://jabjnjhvkmzjxbbuqccr.supabase.co/functions/v1/push-daily-tasks',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body    := '{}'::jsonb
    );
  $$
);

-- 📅 Kalender-Erinnerung — täglich 20:00 Uhr (UTC = 18:00 Uhr)
SELECT cron.schedule(
  'push-calendar-reminder',
  '0 18 * * *',
  $$
    SELECT net.http_post(
      url     := 'https://jabjnjhvkmzjxbbuqccr.supabase.co/functions/v1/push-calendar-reminder',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body    := '{}'::jsonb
    );
  $$
);

-- 📊 Wochenübersicht — Montag 9:00 Uhr (UTC = 7:00 Uhr)
SELECT cron.schedule(
  'push-weekly-overview',
  '0 7 * * 1',
  $$
    SELECT net.http_post(
      url     := 'https://jabjnjhvkmzjxbbuqccr.supabase.co/functions/v1/push-weekly-overview',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body    := '{}'::jsonb
    );
  $$
);

-- ══════════════════════════════════════════════════════════════
-- Bestehende Cron-Jobs anzeigen:
--   SELECT * FROM cron.job;
--
-- Cron-Job löschen (falls nötig):
--   SELECT cron.unschedule('push-daily-tasks');
-- ══════════════════════════════════════════════════════════════
