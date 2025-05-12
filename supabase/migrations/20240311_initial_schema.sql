-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create custom types
create type user_role as enum ('user', 'admin');
create type team_role as enum ('owner', 'admin', 'editor', 'viewer');
create type plan_type as enum ('free', 'pro', 'enterprise');
create type model_type as enum ('openai', 'claude', 'midjourney', 'dalle', 'other');
create type visibility_type as enum ('public', 'private', 'team');
create type payment_status as enum ('active', 'canceled', 'past_due', 'trialing');

-- Create users table
create table users (
    id uuid primary key default uuid_generate_v4(),
    email text unique not null,
    name text,
    password_hash text,
    role user_role default 'user',
    plan plan_type default 'free',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create teams table
create table teams (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    owner_id uuid references users(id) on delete cascade,
    plan plan_type default 'free',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create team_users table
create table team_users (
    team_id uuid references teams(id) on delete cascade,
    user_id uuid references users(id) on delete cascade,
    role team_role default 'viewer',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (team_id, user_id)
);

-- Create prompts table
create table prompts (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    body text not null,
    model_type model_type not null,
    tags text[] default '{}',
    visibility visibility_type default 'private',
    created_by uuid references users(id) on delete cascade,
    team_id uuid references teams(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create prompt_versions table
create table prompt_versions (
    id uuid primary key default uuid_generate_v4(),
    prompt_id uuid references prompts(id) on delete cascade,
    version_number integer not null,
    body text not null,
    changelog text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references users(id) on delete set null
);

-- Create marketplace_prompts table
create table marketplace_prompts (
    prompt_id uuid primary key references prompts(id) on delete cascade,
    price decimal(10,2) not null,
    downloads integer default 0,
    average_rating decimal(3,2) default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create prompt_ratings table
create table prompt_ratings (
    id uuid primary key default uuid_generate_v4(),
    prompt_id uuid references prompts(id) on delete cascade,
    user_id uuid references users(id) on delete cascade,
    rating integer check (rating >= 1 and rating <= 5),
    comment text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(prompt_id, user_id)
);

-- Create payments table
create table payments (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references users(id) on delete cascade,
    stripe_customer_id text,
    stripe_subscription_id text,
    plan plan_type not null,
    status payment_status not null,
    billing_cycle text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create audit_logs table
create table audit_logs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references users(id) on delete set null,
    team_id uuid references teams(id) on delete set null,
    action text not null,
    resource_type text not null,
    resource_id uuid,
    metadata jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index idx_prompts_created_by on prompts(created_by);
create index idx_prompts_team_id on prompts(team_id);
create index idx_prompts_visibility on prompts(visibility);
create index idx_prompt_versions_prompt_id on prompt_versions(prompt_id);
create index idx_team_users_user_id on team_users(user_id);
create index idx_team_users_team_id on team_users(team_id);
create index idx_prompt_ratings_prompt_id on prompt_ratings(prompt_id);
create index idx_payments_user_id on payments(user_id);
create index idx_audit_logs_user_id on audit_logs(user_id);
create index idx_audit_logs_team_id on audit_logs(team_id);

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Add updated_at triggers
create trigger update_users_updated_at
    before update on users
    for each row
    execute function update_updated_at_column();

create trigger update_teams_updated_at
    before update on teams
    for each row
    execute function update_updated_at_column();

create trigger update_prompts_updated_at
    before update on prompts
    for each row
    execute function update_updated_at_column();

create trigger update_marketplace_prompts_updated_at
    before update on marketplace_prompts
    for each row
    execute function update_updated_at_column();

create trigger update_payments_updated_at
    before update on payments
    for each row
    execute function update_updated_at_column(); 