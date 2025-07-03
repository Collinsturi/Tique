ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "updateAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "verificationCode" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "isVerified" boolean;