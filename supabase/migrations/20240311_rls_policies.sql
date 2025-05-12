-- Enable Row Level Security
alter table users enable row level security;
alter table teams enable row level security;
alter table team_users enable row level security;
alter table prompts enable row level security;
alter table prompt_versions enable row level security;
alter table marketplace_prompts enable row level security;
alter table prompt_ratings enable row level security;
alter table payments enable row level security;
alter table audit_logs enable row level security;

-- Users policies
create policy "Users can view their own data"
  on users for select
  using (auth.uid() = id);

create policy "Users can update their own data"
  on users for update
  using (auth.uid() = id);

-- Teams policies
create policy "Team members can view their teams"
  on teams for select
  using (
    auth.uid() = owner_id or
    exists (
      select 1 from team_users
      where team_users.team_id = teams.id
      and team_users.user_id = auth.uid()
    )
  );

create policy "Team owners can update their teams"
  on teams for update
  using (auth.uid() = owner_id);

create policy "Team owners can delete their teams"
  on teams for delete
  using (auth.uid() = owner_id);

-- Team users policies
create policy "Team members can view team users"
  on team_users for select
  using (
    exists (
      select 1 from teams
      where teams.id = team_users.team_id
      and (teams.owner_id = auth.uid() or
           exists (
             select 1 from team_users
             where team_users.team_id = teams.id
             and team_users.user_id = auth.uid()
           )
      )
    )
  );

create policy "Team owners can manage team users"
  on team_users for all
  using (
    exists (
      select 1 from teams
      where teams.id = team_users.team_id
      and teams.owner_id = auth.uid()
    )
  );

-- Prompts policies
create policy "Users can view their own prompts"
  on prompts for select
  using (
    created_by = auth.uid() or
    visibility = 'public' or
    (visibility = 'team' and
     exists (
       select 1 from team_users
       where team_users.team_id = prompts.team_id
       and team_users.user_id = auth.uid()
     )
    )
  );

create policy "Users can create prompts"
  on prompts for insert
  with check (auth.uid() = created_by);

create policy "Users can update their own prompts"
  on prompts for update
  using (auth.uid() = created_by);

create policy "Users can delete their own prompts"
  on prompts for delete
  using (auth.uid() = created_by);

-- Prompt versions policies
create policy "Users can view prompt versions"
  on prompt_versions for select
  using (
    exists (
      select 1 from prompts
      where prompts.id = prompt_versions.prompt_id
      and (prompts.created_by = auth.uid() or
           prompts.visibility = 'public' or
           (prompts.visibility = 'team' and
            exists (
              select 1 from team_users
              where team_users.team_id = prompts.team_id
              and team_users.user_id = auth.uid()
            )
           )
      )
    )
  );

create policy "Users can create prompt versions"
  on prompt_versions for insert
  with check (
    exists (
      select 1 from prompts
      where prompts.id = prompt_versions.prompt_id
      and prompts.created_by = auth.uid()
    )
  );

-- Marketplace prompts policies
create policy "Anyone can view marketplace prompts"
  on marketplace_prompts for select
  using (true);

create policy "Users can create marketplace prompts"
  on marketplace_prompts for insert
  with check (
    exists (
      select 1 from prompts
      where prompts.id = marketplace_prompts.prompt_id
      and prompts.created_by = auth.uid()
    )
  );

create policy "Users can update their marketplace prompts"
  on marketplace_prompts for update
  using (
    exists (
      select 1 from prompts
      where prompts.id = marketplace_prompts.prompt_id
      and prompts.created_by = auth.uid()
    )
  );

-- Prompt ratings policies
create policy "Anyone can view prompt ratings"
  on prompt_ratings for select
  using (true);

create policy "Users can create prompt ratings"
  on prompt_ratings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own ratings"
  on prompt_ratings for update
  using (auth.uid() = user_id);

create policy "Users can delete their own ratings"
  on prompt_ratings for delete
  using (auth.uid() = user_id);

-- Payments policies
create policy "Users can view their own payments"
  on payments for select
  using (auth.uid() = user_id);

create policy "Users can create payments"
  on payments for insert
  with check (auth.uid() = user_id);

-- Audit logs policies
create policy "Team members can view audit logs"
  on audit_logs for select
  using (
    auth.uid() = user_id or
    exists (
      select 1 from team_users
      where team_users.team_id = audit_logs.team_id
      and team_users.user_id = auth.uid()
    )
  ); 