-- Migration : flow auth + alarmes (étape 2)
-- À appliquer sur une base déjà initialisée avec schema.sql v1.

alter table profiles add column if not exists onboarding_completed boolean default false;
alter table alarms   add column if not exists notification_ids text[] default '{}';
