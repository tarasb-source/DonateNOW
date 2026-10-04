-- Supabase grants its public API roles (anon, authenticated) full access to new
-- tables in "public". None of our tables should be reachable through that API:
-- only our server, connecting as the table owner, reads and writes them.
--
-- Guarded so it also runs where these don't exist: Prisma's shadow database has no
-- _prisma_migrations table, and non-Supabase Postgres has no anon/authenticated roles.
DO $$
BEGIN
    -- Prisma's migration history; tampering with it could break future migrations.
    IF to_regclass('public._prisma_migrations') IS NOT NULL THEN
        ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
    END IF;

    -- RLS doesn't cover TRUNCATE, so also remove the API roles' privileges entirely.
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        REVOKE ALL ON TABLE "Opportunity", "ContactMessage" FROM anon, authenticated;
        IF to_regclass('public._prisma_migrations') IS NOT NULL THEN
            REVOKE ALL ON TABLE "_prisma_migrations" FROM anon, authenticated;
        END IF;
    END IF;
END $$;
