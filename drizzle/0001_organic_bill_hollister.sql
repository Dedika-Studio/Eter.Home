CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`buyerName` varchar(255) NOT NULL,
	`buyerPhone` varchar(20) NOT NULL,
	`buyerEmail` varchar(320),
	`ticketNumbers` text NOT NULL,
	`ticketCount` int NOT NULL,
	`totalAmount` int NOT NULL,
	`status` enum('pending','paid','failed','expired') NOT NULL DEFAULT 'pending',
	`stripeSessionId` varchar(255),
	`stripePaymentIntentId` varchar(255),
	`syncedToSheets` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`number` varchar(3) NOT NULL,
	`status` enum('available','reserved','sold') NOT NULL DEFAULT 'available',
	`buyerName` varchar(255),
	`buyerPhone` varchar(20),
	`buyerEmail` varchar(320),
	`userId` int,
	`orderId` int,
	`reservedAt` bigint,
	`soldAt` bigint,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tickets_id` PRIMARY KEY(`id`),
	CONSTRAINT `tickets_number_unique` UNIQUE(`number`)
);
