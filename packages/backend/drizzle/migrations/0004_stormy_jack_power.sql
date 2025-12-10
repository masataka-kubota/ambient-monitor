CREATE INDEX `idx_devices_external_id` ON `devices` (`external_id`);--> statement-breakpoint
CREATE INDEX `idx_measurements_device_id` ON `measurements` (`device_id`);--> statement-breakpoint
CREATE INDEX `idx_measurements_created_at` ON `measurements` (`created_at`);