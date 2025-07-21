ALTER TYPE "public"."user_role" ADD VALUE 'organizer';--> statement-breakpoint
CREATE TABLE "staff_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"event_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"is_valid" boolean DEFAULT false NOT NULL,
	"reasonForOverride" varchar NOT NULL,
	"overridden_by_user_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "Events" ADD COLUMN "organizer_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "staff_assignments" ADD CONSTRAINT "staff_assignments_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_assignments" ADD CONSTRAINT "staff_assignments_event_id_Events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."Events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_logs" ADD CONSTRAINT "ticket_logs_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_logs" ADD CONSTRAINT "ticket_logs_overridden_by_user_id_User_id_fk" FOREIGN KEY ("overridden_by_user_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Events" ADD CONSTRAINT "Events_organizer_id_User_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;