ALTER TABLE "tickets" DROP CONSTRAINT "tickets_event_id_Venue_id_fk";
--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_event_id_Events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."Events"("id") ON DELETE no action ON UPDATE no action;