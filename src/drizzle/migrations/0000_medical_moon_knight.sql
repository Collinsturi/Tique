CREATE TYPE "public"."order_status" AS ENUM('completed', 'in_progress');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('m-pesa', 'stripe', 'paypal');--> statement-breakpoint
CREATE TYPE "public"."support_status" AS ENUM('open', 'closed', 'in_progress');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'customer', 'check_in_staff');--> statement-breakpoint
CREATE TABLE "CustomerSupport" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"subject" varchar NOT NULL,
	"description" text NOT NULL,
	"status" "support_status" DEFAULT 'open' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"Description" text NOT NULL,
	"Venue_id" integer NOT NULL,
	"Category" varchar NOT NULL,
	"event_Date" date NOT NULL,
	"event_time" time NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer,
	"ticket_type_id" integer,
	"quantity" integer,
	"unit_price" integer,
	"subtotal" integer
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"total_amount" bigint,
	"status" "order_status" DEFAULT 'in_progress' NOT NULL,
	"payment_method" "payment_method" DEFAULT 'stripe' NOT NULL,
	"transaction_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Payment" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"amount" bigint NOT NULL,
	"paymentStatus" bigint NOT NULL,
	"paymentDate" bigint NOT NULL,
	"paymentMethod" bigint NOT NULL,
	"transaction_ID" bigint NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer,
	"typeName" varchar,
	"price" bigint,
	"quantity_available" integer,
	"quantity_sold" integer
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_item_id" bigint,
	"user_id" integer NOT NULL,
	"event_id" integer NOT NULL,
	"ticket_type_id" integer,
	"unique_code" varchar NOT NULL,
	"is_scanned" boolean DEFAULT false NOT NULL,
	"scanned_at" timestamp,
	"scanned_by_user" integer
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" serial PRIMARY KEY NOT NULL,
	"firstName" varchar NOT NULL,
	"lastName" varchar NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar NOT NULL,
	"contactPhone" varchar NOT NULL,
	"address" varchar,
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"verificationCode" integer NOT NULL,
	"isVerified" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updateAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "User_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "Venue" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"addresses" varchar NOT NULL,
	"capacity" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "CustomerSupport" ADD CONSTRAINT "CustomerSupport_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Events" ADD CONSTRAINT "Events_Venue_id_Venue_id_fk" FOREIGN KEY ("Venue_id") REFERENCES "public"."Venue"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_ticket_type_id_ticket_types_id_fk" FOREIGN KEY ("ticket_type_id") REFERENCES "public"."ticket_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_types" ADD CONSTRAINT "ticket_types_event_id_Events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."Events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_event_id_Venue_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."Venue"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_ticket_type_id_ticket_types_id_fk" FOREIGN KEY ("ticket_type_id") REFERENCES "public"."ticket_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_scanned_by_user_User_id_fk" FOREIGN KEY ("scanned_by_user") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "User_email_index" ON "User" USING btree ("email");--> statement-breakpoint
CREATE INDEX "User_role_index" ON "User" USING btree ("role");