create or replace function deebee_dms.get_auth_user_identities_by_email(v_email text)
returns table(provider_id text, user_id uuid, identity_data text, provider text)
set search_path = ''
security definer
language plpgsql
as
$$
begin
    return query
        select
            i.provider_id,
            i.user_id,
            coalesce(i.identity_data::text, '') as identity_data,
            i.provider
        from auth.identities i
        where i.email = v_email;
end;
$$;

revoke all on function deebee_dms.get_auth_user_identities_by_email(text) from authenticated, anon, public;
grant execute on function deebee_dms.get_auth_user_identities_by_email(text) to supabase_auth_admin, service_role;