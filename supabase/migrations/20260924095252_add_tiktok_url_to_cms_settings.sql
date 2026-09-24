/*
# Add TikTok social link to site settings

1. Modified Tables
- `ape_cms_settings`: adds `tiktok_url` as an optional text field for the site's TikTok profile URL.

2. Application Impact
- Existing social links and all current settings remain unchanged.
- The new field is empty by default and is shown only when a TikTok URL is entered.

3. Security
- No new tables or policies are created.
- The existing settings table RLS policies continue to control access.
*/

ALTER TABLE ape_cms_settings
  ADD COLUMN IF NOT EXISTS tiktok_url text;
