create or replace function deebee_dms.get_auth_user_by_phone(v_phone text)
returns table (id uuid, email character varying(255), phone text, email_confirmed boolean, phone_confirmed boolean)
language plpgsql
set search_path = ''
security definer
as $$
begin
    return query
        select
         u.id
         ,coalesce(u.email, '') as email
         ,coalesce(u.phone, '') as phone
         ,case when u.email_confirmed_at is not null then 'yes'::boolean else 'no'::boolean end as email_confirmed
         ,case when u.phone_confirmed_at is not null then 'yes'::boolean else 'no'::boolean end as phone_confirmed
        from auth.users u
        where u.phone = v_phone
        or u.phone = regexp_replace(v_phone, '[^0-9]', '', 'g')
        limit 1;
end;
$$;

revoke all on function deebee_dms.get_auth_user_by_phone(text) from authenticated, anon, public;
grant execute on function deebee_dms.get_auth_user_by_phone(text) to supabase_auth_admin, service_role;