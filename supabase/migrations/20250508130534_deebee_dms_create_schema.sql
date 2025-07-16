CREATE SCHEMA IF NOT EXISTS deebee_dms;

GRANT USAGE ON SCHEMA deebee_dms TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA deebee_dms TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA deebee_dms TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA deebee_dms TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA deebee_dms GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA deebee_dms GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA deebee_dms GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;