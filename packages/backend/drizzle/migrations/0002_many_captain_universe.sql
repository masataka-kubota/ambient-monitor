ALTER TABLE `measurements` ADD `device_id` integer NOT NULL REFERENCES devices(id);--> statement-breakpoint
CREATE UNIQUE INDEX `devices_device_id_unique` ON `devices` (`device_id`);