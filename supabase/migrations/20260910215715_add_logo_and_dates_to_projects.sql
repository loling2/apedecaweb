/*
# Add logo_url, start_date, end_date to ape_projects

1. Modified Table
- `ape_projects`: adds three optional columns:
  - `logo_url` (text) — URL of a logo image to overlay in the top-right corner of the slider.
  - `start_date` (date) — project start date shown as "dd/mm/yyyy" in the slider.
  - `end_date` (date) — project end date shown as "dd/mm/yyyy" in the slider.

2. Security
- No policy changes; existing RLS policies remain in effect.
*/

ALTER TABLE ape_projects
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS end_date date;
