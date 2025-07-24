import express from "express";
import venueRoutes from "./components/venue/venue.routes";
import eventRoutes from "./components/event/event.routes"
import ticketRoutes from "./components/ticket/ticket.routes";
import ticketTypeRoutes from "./components/ticketTypes/ticketType.routes";
import orderRoutes  from "./components/order/order.routes";
import customerSupportRoutes from "./components/customerSupport/customerSupport.routes"
import paymentRoutes from "./components/payment/payment.routes"
import authRoutes from "./components/authentication/authentication.router"
import cors from "cors";
import analyticsRoutes from "./components/analytics/analytics.router"
import session from "express-session"; // Import express-session
import passport from "passport"; // Import passport
import "dotenv/config";
import "./middleware/passport";

const initializeApp = () => {
    const app = express();
    app.use(express.json());

    // Configure session middleware
    app.use(session({
        secret: process.env.SESSION_SECRET as string, // A strong secret for session encryption
        resave: false, // Don't save session if unmodified
        saveUninitialized: false, // Don't create session until something stored
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // Session expires in 24 hours
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            httpOnly: true, // Prevent client-side JS from reading the cookie
            sameSite: 'lax', // CSRF protection
        }
    }));

    // Initialize Passport.js
    app.use(passport.initialize());
    app.use(passport.session()); // Use passport.session() if you intend to use persistent login sessions

    app.use(cors({
        origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5174'], // Allow your frontend URL(s)
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true
    }));

    //Application Routes
    app.use("/api", authRoutes)
    app.use("/api", eventRoutes);
    app.use("/api", venueRoutes);
    app.use("/api", ticketRoutes);
    app.use("/api", ticketTypeRoutes);
    app.use("/api", orderRoutes);
    app.use("/api", customerSupportRoutes);
    app.use("/api", paymentRoutes);
    app.use("/api", analyticsRoutes)

    return app;
}

const app = initializeApp();
export default app;
