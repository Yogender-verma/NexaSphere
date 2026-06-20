-- Email Campaign System Migration
-- Run this migration to add email campaign tables to the database

-- Email Campaigns table
create table if not exists email_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  template_name text,
  content jsonb not null default '{}'::jsonb,
  segment_criteria jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  scheduled_at timestamz,
  sent_at timestamz,
  created_by uuid,
  created_at timestamz not null default now(),
  updated_at timestamz not null default now()
);

create index if not exists idx_email_campaigns_status on email_campaigns (status);
create index if not exists idx_email_campaigns_created_at on email_campaigns (created_at desc);

-- Email Campaign Analytics table
create table if not exists email_campaign_analytics (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references email_campaigns(id) on delete cascade,
  recipient_email text not null,
  recipient_name text,
  status text not null default 'sent',
  opened_at timestamz,
  clicked_at timestamz,
  unsubscribed_at timestamz,
  sent_at timestamz,
  created_at timestamz not null default now()
);

create index if not exists idx_email_campaign_analytics_campaign on email_campaign_analytics (campaign_id);
create index if not exists idx_email_campaign_analytics_email on email_campaign_analytics (recipient_email);

-- Email Templates table
create table if not exists email_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text,
  html_content text not null,
  category text not null default 'general',
  is_default boolean not null default false,
  created_by uuid,
  created_at timestamz not null default now(),
  updated_at timestamz not null default now()
);

create index if not exists idx_email_templates_category on email_templates (category);

-- Email Unsubscribes table
create table if not exists email_unsubscribes (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  reason text,
  created_at timestamz not null default now()
);

create index if not exists idx_email_unsubscribes_email on email_unsubscribes (email);

-- Email Automation Triggers table
create table if not exists email_automation_triggers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trigger_type text not null,
  campaign_id uuid references email_campaigns(id) on delete set null,
  conditions jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_by uuid,
  created_at timestamz not null default now(),
  updated_at timestamz not null default now()
);

create index if not exists idx_email_automation_triggers_type on email_automation_triggers (trigger_type);
create index if not exists idx_email_automation_triggers_active on email_automation_triggers (is_active);
