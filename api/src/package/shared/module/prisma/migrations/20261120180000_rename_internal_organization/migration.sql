-- The temporary name "Umbrielship" gives way to the brand "maréOS" (AD-123). The internal
-- Organization the tenancy migration backfilled, or the seed created, takes the new name and email
-- while it still holds the old ones and no Organization already holds the new ones.
UPDATE "organizations"
SET "name" = 'maréOS'
WHERE "isInternal" = true
  AND "name" = 'Umbrielship'
  AND NOT EXISTS (SELECT 1 FROM "organizations" WHERE "name" = 'maréOS');

UPDATE "organizations"
SET "email" = 'internal@mareos.local'
WHERE "isInternal" = true
  AND "email" = 'internal@umbrielship.local'
  AND NOT EXISTS (SELECT 1 FROM "organizations" WHERE "email" = 'internal@mareos.local');
