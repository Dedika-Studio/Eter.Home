CREATE TABLE `raffles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`image` text NOT NULL,
	`totalTickets` int NOT NULL,
	`pricePerTicket` int NOT NULL,
	`drawDate` timestamp NOT NULL,
	`webhookUrl` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `raffles_id` PRIMARY KEY(`id`)
);
