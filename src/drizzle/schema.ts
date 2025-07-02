import { pgTable, serial, varchar, integer, bigint, timestamp, index, text, pgEnum, primaryKey } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['admin', 'customer', 'check_in_staff']);
export const supportStatusEnum = pgEnum('support_status', ['open', 'closed', 'in_progress']);

// User Table
export const User = pgTable('User', {
    id: serial('id').primaryKey(),
    firstName: varchar('firstName').notNull(),
    lastName: varchar('lastName').notNull(),
    email: varchar('email').notNull().unique(),
    password: varchar('password').notNull(),
    contactPhone: integer('contactPhone').notNull(),
    address: varchar('address'),
    role: userRoleEnum('role').notNull(),
    createdAt: timestamp('createdAt').notNull(),
    updateAt: timestamp('updateAt').notNull(),
}, (table) => ({
    emailIndex: index('User_email_index').on(table.email),
    roleIndex: index('User_role_index').on(table.role),
}));

// Payment Table
export const Payment = pgTable('Payment', {
    id: serial('id').primaryKey(),
    orderId: integer('order_id').notNull(),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    paymentStatus: bigint('paymentStatus', { mode: 'number' }).notNull(),
    paymentDate: bigint('paymentDate', { mode: 'number' }).notNull(),
    paymentMethod: bigint('paymentMethod', { mode: 'number' }).notNull(),
    transactionId: bigint('transaction_ID', { mode: 'number' }).notNull(),
    createdAt: bigint('createdAt', { mode: 'number' }).notNull(),
    updatedAt: bigint('updatedAt', { mode: 'number' }).notNull(),
});

// CustomerSupport Table
export const CustomerSupport = pgTable('CustomerSupport', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => User.id),
    subject: varchar('subject').notNull(),
    description: text('description').notNull(),
    status: supportStatusEnum('status').notNull(),
    createdAt: timestamp('createdAt').notNull(),
    updatedAt: timestamp('updatedAt').notNull(),
});

// Venue Table
export const Venue = pgTable('Venue', {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    addresses: varchar('addresses').notNull(),
    capacity: integer('capacity').notNull(),
    createdAt: timestamp('createdAt').notNull(),
});

// Events Table
export const Events = pgTable('Events', {
    id: serial('id').primaryKey(),
    title: bigint('title', { mode: 'number' }).notNull(),
    Description: text('Description').notNull(),
    VenueId: integer('Venue_id').notNull().references(() => Venue.id),
    Category: varchar('Category').notNull(),
    eventDate: timestamp('event_Date').notNull(),
    eventTime: timestamp('event_time').notNull(),
    createdAt: timestamp('createdAt').notNull(),
    updatedAt: timestamp('updatedAt').notNull(),
});

// Ticket Types Table
export const TicketTypes = pgTable('ticket_types', {
    id: serial('id').primaryKey(),
    eventId: integer('event_id').references(() => Events.id),
    typeName: varchar('typeName'),
    price: bigint('price', { mode: 'number' }),
    quantityAvailable: integer('quantity_available'),
    quantitySold: integer('quantity_sold'),
});

// Orders Table
export const Orders = pgTable('orders', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => User.id),
    totalAmount: bigint('total_amount', { mode: 'number' }),
    status: text('status'),
    paymentMethod: bigint('payment_method', { mode: 'number' }),
    transactionId: varchar('transaction_id'),
    createdAt: timestamp('created_at'),
    updatedAt: timestamp('updated_at'),
});

// Order Items Table
export const OrderItems = pgTable('order_items', {
    id: serial('id').primaryKey(),
    orderId: integer('order_id').references(() => Orders.id),
    ticketTypeId: integer('ticket_type_id').references(() => TicketTypes.id),
    quantity: integer('quantity'),
    unitPrice: integer('unit_price'),
    subtotal: integer('subtotal'),
});

// Tickets Table
export const Tickets = pgTable('tickets', {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    orderItemId: bigint('order_item_id', { mode: 'number' }),
    userId: integer('user_id').notNull().references(() => User.id),
    eventId: integer('event_id').notNull().references(() => Venue.id),
    ticketTypeId: integer('ticket_type_id').references(() => TicketTypes.id),
    uniqueCode: bigint('unique_code', { mode: 'number' }),
    isScanned: bigint('is_scanned', { mode: 'number' }),
    scannedAt: bigint('scanned_at', { mode: 'number' }),
    scannedByUser: integer('scanned_by_user').references(() => User.id),
});


export const TicketInsert = typeof Tickets.$inferInsert;
export const TicketSelect = typeof Tickets.$inferSelect;

export const OrderItemInsert = typeof OrderItems.$inferInsert;
export const OrderItemSelect = typeof OrderItems.$inferSelect;

export const OrderInsert = typeof Orders.$inferInsert;
export const OrderSelect = typeof Orders.inferSelect;

export const TicketTypesInsert = typeof TicketTypes.$inferInsert;
export const TicketTypesSelect = typeof TicketTypes.$inferSelect;

export const EventInsert = typeof Events.$inferInsert;
export const EventSelect = typeof Events.$inferSelect;

export const VenueInsert = typeof Venue.inferInsert;
export const VenueSelect = typeof Venue.inferSelect;

export const CustomerSupportInsert = typeof CustomerSupport.$inferInsert;
export const CustomerSupportSelect = typeof CustomerSupport.$inferSelect;

export const PaymentInsert = typeof Payment.inferInsert;
export const PaymentSelect = typeof Payment.inferSelect;

export const UserInsert = typeof User.inferInsert;
export const UserSelect = typeof User.inferSelect;