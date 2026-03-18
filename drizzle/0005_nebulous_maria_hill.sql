ALTER TABLE `raffles` ADD `raffleNumber` int NOT NULL;--> statement-breakpoint
ALTER TABLE `raffles` ADD CONSTRAINT `raffles_raffleNumber_unique` UNIQUE(`raffleNumber`);