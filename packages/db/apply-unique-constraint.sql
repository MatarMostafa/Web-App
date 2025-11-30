-- Add unique constraint to teamLeaderId if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'teams_teamLeaderId_key'
    ) THEN
        ALTER TABLE teams ADD CONSTRAINT teams_teamLeaderId_key UNIQUE (teamLeaderId);
    END IF;
END $$;