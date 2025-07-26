import {
    pgTable,
    serial,
    varchar,
    integer,
    bigint,
    timestamp,
    index,
    text,
    pgEnum,
    primaryKey,
    boolean, date, time
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ========================
// User Roles Enum
// ========================
export const userRoles = ['admin', 'event_attendee', 'check_in_staff', `organizer`] as const;
export const userRoleEnum = pgEnum('user_role', userRoles);
export type UserRole = typeof userRoles[number];

// ========================
// Support Status Enum
// ========================
export const supportStatuses = ['open', 'closed', 'in_progress'] as const;
export const supportStatusEnum = pgEnum('support_status', supportStatuses);
export type SupportStatus = typeof supportStatuses[number];

// ========================
// Order Status Enum
// ========================
export const orderStatuses = ['completed', 'in_progress', 'cancelled', 'pending_payment'] as const; // Added pending_payment, cancelled
export const orderStatusEnum = pgEnum('order_status', orderStatuses);
export type OrderStatus = typeof orderStatuses[number];

// ========================
// Payment Method Enum
// ========================
export const paymentMethods = ['mpesa', 'paystack', 'credit_card'] as const; // Added credit_card
export const paymentMethodEnum = pgEnum('payment_method', paymentMethods);
export type PaymentMethod = typeof paymentMethods[number];

// ========================
// Payment Status Enum (New for Payment table)
// ========================
export const paymentStatuses = ['pending', 'completed', 'failed', 'refunded'] as const;
export const paymentStatusEnum = pgEnum('payment_status', paymentStatuses);
export type PaymentStatus = typeof paymentStatuses[number];


// User Table
export const User = pgTable('User', {
    id: serial('id').primaryKey(),
    firstName: varchar('firstName').notNull(),
    lastName: varchar('lastName').notNull(),
    email: varchar('email').notNull().unique(),
    password: varchar('password').notNull(),
    contactPhone: varchar('contactPhone'),
    address: varchar('address'),
    role: userRoleEnum('role').default('event_attendee').notNull(),
    verificationCode: integer('verificationCode').notNull(),
    isVerified: boolean('isVerified').default(false).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updateAt: timestamp('updateAt').defaultNow().notNull(),
    googleId: text("google_id").unique(),
    profilePicture: varchar('profilePicture')
}, (table) => ({
    emailIndex: index('User_email_index').on(table.email),
    roleIndex: index('User_role_index').on(table.role),
}));

// Payment Table
export const Payment = pgTable('Payment', {
    id: serial('id').primaryKey(),
    orderId: integer('order_id').notNull().references(() => Orders.id), // Added reference to Orders
    amount: bigint('amount', { mode: 'number' }).notNull(),
    paymentStatus: paymentStatusEnum('payment_status').notNull().default('pending'), // Changed to enum
    paymentDate: timestamp('payment_date').notNull().defaultNow(), // Changed to timestamp
    paymentMethod: paymentMethodEnum('payment_method').notNull(), // Changed to enum
    transactionId: varchar('transaction_ID').notNull(), // Changed to varchar for typical transaction IDs
    createdAt: timestamp('createdAt').notNull().defaultNow(), // Changed to timestamp
    updatedAt: timestamp('updatedAt').notNull().defaultNow(), // Changed to timestamp
});

// CustomerSupport Table
export const CustomerSupport = pgTable('CustomerSupport', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => User.id),
    subject: varchar('subject').notNull(),
    description: text('description').notNull(),
    status: supportStatusEnum('status').notNull().default('open'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Venue Table
export const Venue = pgTable('Venue', {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    addresses: varchar('addresses').notNull(),
    capacity: integer('capacity').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updateAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Events Table
export const Events = pgTable('Events', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    Description: text('Description').notNull(),
    VenueId: integer('Venue_id').notNull().references(() => Venue.id),
    Category: varchar('Category').notNull(),
    eventDate: date('event_Date').notNull(),
    eventTime: time('event_time').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
    organizerId:  integer('organizer_id').notNull().references(() => User.id),
    latitude: varchar('latitude'),
    longitude: varchar('longitude'),
    posterImageUrl: varchar('posterImageUrl'),
    thumbnailImageUrl: varchar('thumbnailImageUrl')
});

// Ticket Types Table
export const TicketTypes = pgTable('ticket_types', {
    id: serial('id').primaryKey(),
    eventId: integer('event_id').references(() => Events.id),
    typeName: varchar('typeName'),
    price: bigint('price', { mode: 'number' }),
    quantityAvailable: integer('quantity_available'),
    quantitySold: integer('quantity_sold'),
    description: varchar('description'),
});

// Orders Table
export const Orders = pgTable('orders', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => User.id),
    totalAmount: bigint('total_amount', { mode: 'number' }),
    status: orderStatusEnum('status').notNull().default('in_progress'),
    paymentMethod: paymentMethodEnum('payment_method').notNull().default('mpesa'),
    transactionId: varchar('transaction_id'), // To store the final transaction ID from payment
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Order Items Table
export const OrderItems = pgTable('order_items', {
    id: serial('id').primaryKey(),
    orderId: integer('order_id').references(() => Orders.id),
    ticketTypeId: integer('ticket_type_id').references(() => TicketTypes.id),
    quantity: integer('quantity'),
    unitPrice: bigint('unit_price', { mode: 'number' }), // Changed to bigint for consistency with price
    subtotal: bigint('subtotal', { mode: 'number' }), // Changed to bigint for consistency with price
});

// Tickets Table
export const Tickets = pgTable('tickets', {
    id: serial('id').primaryKey(),
    orderItemId: integer('order_item_id').references(() => OrderItems.id), // Corrected to integer
    userId: integer('user_id').notNull().references(() => User.id),
    eventId: integer('event_id').notNull().references(() => Events.id),
    ticketTypeId: integer('ticket_type_id').references(() => TicketTypes.id),
    uniqueCode: varchar('unique_code').notNull(),
    isScanned: boolean('is_scanned').default(false).notNull(),
    scannedAt: timestamp('scanned_at'),
    scannedByUser: integer('scanned_by_user').references(() => User.id),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export const StaffAssignments = pgTable('staff_assignments', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => User.id),
    eventId: integer('event_id').notNull().references(() => Events.id),
});

export const TicketLogs = pgTable('ticket_logs', {
    id: serial('id').primaryKey(),
    ticketId: integer('ticket_id').notNull().references(() => Tickets.id),
    isValid: boolean("is_valid").default(false).notNull(),
    reasonForOverride: varchar('reason_for_override').notNull(),
    overriddenByUserId: integer('overridden_by_user_id').references(() => User.id),
    createdAt: timestamp('created_at').defaultNow(),
});


// Define relations for easier querying
export const userRelations = relations(User, ({ many }) => ({
    orders: many(Orders),
    customerSupports: many(CustomerSupport),
    tickets: many(Tickets),
    staffAssignments: many(StaffAssignments),
}));

export const orderRelations = relations(Orders, ({ one, many }) => ({
    user: one(User, {
        fields: [Orders.userId],
        references: [User.id],
    }),
    orderItems: many(OrderItems),
    payments: many(Payment),
}));

export const orderItemRelations = relations(OrderItems, ({ one, many }) => ({
    order: one(Orders, {
        fields: [OrderItems.orderId],
        references: [Orders.id],
    }),
    ticketType: one(TicketTypes, {
        fields: [OrderItems.ticketTypeId],
        references: [TicketTypes.id],
    }),
    tickets: many(Tickets),
}));

export const ticketTypeRelations = relations(TicketTypes, ({ one, many }) => ({
    event: one(Events, {
        fields: [TicketTypes.eventId],
        references: [Events.id],
    }),
    orderItems: many(OrderItems),
    tickets: many(Tickets),
}));

export const eventRelations = relations(Events, ({ one, many }) => ({
    venue: one(Venue, {
        fields: [Events.VenueId],
        references: [Venue.id],
    }),
    organizer: one(User, {
        fields: [Events.organizerId],
        references: [User.id],
    }),
    ticketTypes: many(TicketTypes),
    tickets: many(Tickets),
    staffAssignments: many(StaffAssignments),
}));

export const ticketRelations = relations(Tickets, ({ one, many }) => ({
    orderItem: one(OrderItems, {
        fields: [Tickets.orderItemId],
        references: [OrderItems.id],
    }),
    user: one(User, {
        fields: [Tickets.userId],
        references: [User.id],
    }),
    event: one(Events, {
        fields: [Tickets.eventId],
        references: [Events.id],
    }),
    ticketType: one(TicketTypes, {
        fields: [Tickets.ticketTypeId],
        references: [TicketTypes.id],
    }),
    scannedBy: one(User, {
        fields: [Tickets.scannedByUser],
        references: [User.id],
    }),
    ticketLogs: many(TicketLogs),
}));

export const paymentRelations = relations(Payment, ({ one }) => ({
    order: one(Orders, {
        fields: [Payment.orderId],
        references: [Orders.id],
    }),
}));


export type TicketInsert = typeof Tickets.$inferInsert;
export type TicketSelect = typeof Tickets.$inferSelect;

export type OrderItemInsert = typeof OrderItems.$inferInsert;
export type OrderItemSelect = typeof OrderItems.$inferSelect;

export type OrderInsert = typeof Orders.$inferInsert;
export type OrderSelect = typeof Orders.$inferSelect;

export type TicketTypesInsert = typeof TicketTypes.$inferInsert;
export type TicketTypesSelect = typeof TicketTypes.$inferSelect;

export type EventInsert = typeof Events.$inferInsert;
export type EventSelect = typeof Events.$inferSelect;

export type VenueInsert = typeof Venue.$inferInsert;
export type VenueSelect = typeof Venue.$inferSelect;

export type CustomerSupportInsert = typeof CustomerSupport.$inferInsert;
export type CustomerSupportSelect = typeof CustomerSupport.$inferSelect;

export type PaymentInsert = typeof Payment.$inferInsert;
export type PaymentSelect = typeof Payment.$inferSelect;

export type UserInsert = typeof User.$inferInsert;
export type UserSelect = typeof User.$inferSelect;

export type TicketLogsInsert = typeof TicketLogs.$inferInsert; // Corrected type
export type TicketLogsSelect = typeof TicketLogs.$inferSelect; // Corrected type
