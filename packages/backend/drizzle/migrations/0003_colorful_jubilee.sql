ALTER TABLE `devices` RENAME COLUMN "device_id" TO "external_id";--> statement-breakpoint
DROP INDEX `devices_device_id_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `devices_external_id_unique` ON `devices` (`external_id`);