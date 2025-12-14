-- Add is_active column to users table
-- This allows admins to activate/deactivate user accounts

ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- Add index for filtering active users
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Add comment
COMMENT ON COLUMN users.is_active IS 'Whether the user account is active. Inactive accounts cannot log in.';
