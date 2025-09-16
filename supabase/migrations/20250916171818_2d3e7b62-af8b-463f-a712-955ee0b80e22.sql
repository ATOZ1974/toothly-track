-- Make 'patient-files' bucket public and allow public read access
-- 1) Ensure the bucket is marked as public
UPDATE storage.buckets
SET public = true
WHERE id = 'patient-files';

-- 2) Create a policy for public read access if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public read access to patient-files'
  ) THEN
    CREATE POLICY "Public read access to patient-files"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'patient-files');
  END IF;
END $$;
