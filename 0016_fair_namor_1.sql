CREATE TABLE `comment_reactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`commentId` int NOT NULL,
	`reactionType` enum('praying','amen','blessed') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comment_reactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `comment_reactions_userId_commentId_reactionType_unique` UNIQUE(`userId`,`commentId`,`reactionType`)
);
--> statement-breakpoint
ALTER TABLE `comment_reactions` ADD CONSTRAINT `comment_reactions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comment_reactions` ADD CONSTRAINT `comment_reactions_commentId_comments_id_fk` FOREIGN KEY (`commentId`) REFERENCES `comments`(`id`) ON DELETE cascade ON UPDATE no action;