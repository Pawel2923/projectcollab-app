-- For usage only in development and testing environments. Grants full access to the specified user by assigning them the highest roles in the system. Use with caution.

\set ON_ERROR_STOP on
\echo '--- Grant full access script ---'

\set user_email 'admin@example.com'
\set org_role_value 'CREATOR'
\set project_role_value 'CREATOR'
\set chat_role_value 'CREATOR'
\set symfony_role 'ROLE_ADMIN'

BEGIN;

SELECT id AS user_id FROM "user" WHERE email = :'user_email' LIMIT 1;
\gset
\if :{?user_id}
\else
\echo 'ERROR: user with email ' :'user_email' ' was not found. Aborting.'
ROLLBACK;
\quit 1
\endif

SELECT id AS org_role_id FROM organization_role WHERE value = :'org_role_value' LIMIT 1;
\gset
\if :{?org_role_id}
\else
\echo 'ERROR: organization role ' :'org_role_value' ' not found. Aborting.'
ROLLBACK;
\quit 1
\endif

SELECT id AS project_role_id FROM project_role WHERE value = :'project_role_value' LIMIT 1;
\gset
\if :{?project_role_id}
\else
\echo 'ERROR: project role ' :'project_role_value' ' not found. Aborting.'
ROLLBACK;
\quit 1
\endif

SELECT id AS chat_role_id FROM chat_role WHERE value = :'chat_role_value' LIMIT 1;
\gset
\if :{?chat_role_id}
\else
\echo 'ERROR: chat role ' :'chat_role_value' ' not found. Aborting.'
ROLLBACK;
\quit 1
\endif

WITH updated AS (SELECT u.id,(SELECT jsonb_agg(v ORDER BY v) FROM (SELECT DISTINCT jsonb_array_elements_text(COALESCE(u.roles::jsonb,'[]'::jsonb) || to_jsonb(ARRAY[ :'symfony_role' ])) AS v) s) AS new_roles FROM "user" u WHERE u.id=:user_id) UPDATE "user" u SET roles=COALESCE(updated.new_roles,'[]'::jsonb)::json FROM updated WHERE u.id=updated.id;
\echo 'User roles updated. Rows affected: ' :ROW_COUNT

INSERT INTO organization_member (member_id,organization_id,role_id,is_blocked,invited_by_id,joined_at) SELECT :user_id,o.id,:org_role_id,FALSE,NULL,NOW() FROM organization o WHERE NOT EXISTS (SELECT 1 FROM organization_member om WHERE om.organization_id=o.id AND om.member_id=:user_id);
\echo 'Organizations granted: ' :ROW_COUNT

INSERT INTO project_member (member_id,project_id,role_id,is_blocked,invited_by_id,joined_at) SELECT :user_id,p.id,:project_role_id,FALSE,NULL,NOW() FROM project p WHERE NOT EXISTS (SELECT 1 FROM project_member pm WHERE pm.project_id=p.id AND pm.member_id=:user_id);
\echo 'Projects granted: ' :ROW_COUNT

INSERT INTO chat_member (chat_id,member_id,role_id,joined_at) SELECT c.id,:user_id,:chat_role_id,NOW() FROM chat c WHERE NOT EXISTS (SELECT 1 FROM chat_member cm WHERE cm.chat_id=c.id AND cm.member_id=:user_id);
\echo 'Chats granted: ' :ROW_COUNT

COMMIT;
\echo 'Full access granted to user ' :'user_email' '.'
