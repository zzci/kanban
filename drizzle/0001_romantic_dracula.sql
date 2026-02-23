CREATE TABLE `agent_profiles` (
	`agent_type` text NOT NULL,
	`name` text NOT NULL,
	`binary_path` text,
	`base_command` text NOT NULL,
	`protocol` text NOT NULL,
	`capabilities` text DEFAULT '[]' NOT NULL,
	`default_model` text,
	`permission_policy` text DEFAULT 'auto' NOT NULL,
	`config` text,
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`is_deleted` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `agent_sessions` (
	`project_id` text NOT NULL,
	`issue_id` text,
	`agent_profile_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`prompt` text NOT NULL,
	`external_session_id` text,
	`working_dir` text,
	`model` text,
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`is_deleted` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `execution_logs` (
	`process_id` text NOT NULL,
	`entry_index` integer NOT NULL,
	`entry_type` text NOT NULL,
	`content` text NOT NULL,
	`metadata` text,
	`timestamp` text,
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`is_deleted` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `execution_processes` (
	`session_id` text NOT NULL,
	`pid` integer,
	`status` text DEFAULT 'spawning' NOT NULL,
	`exit_code` integer,
	`started_at` integer,
	`finished_at` integer,
	`action_type` text DEFAULT 'initial' NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`is_deleted` integer DEFAULT 0 NOT NULL
);
