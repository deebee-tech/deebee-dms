create policy "Authenticated users and service role can receive broadcasts"
on "realtime"."messages"
for select
to authenticated, service_role
using ( true );