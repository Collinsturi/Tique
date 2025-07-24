import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import "dotenv/config";
import { UserService } from '../components/authentication/authentication.service';
import { type UserInsert } from '../drizzle/schema';

// Configure Google Strategy
passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: process.env.GOOGLE_CALLBACK_URL as string, // e.g., http://localhost:3000/api/v1/auth/google/callback
        passReqToCallback: true, // Allows access to req in callback
    },
    async (request, accessToken, refreshToken, profile, done) => {
        try {
            // Find or create user in your database
            let user = await UserService.findUserByGoogleId(profile.id);

            if (!user) {
                // If user doesn't exist, create a new one
                user = await UserService.createUser({
                    googleId: profile.id,
                    firstName: profile.name?.givenName || '',
                    lastName: profile.name?.familyName || '',
                    email: profile.emails && profile.emails[0] ? profile.emails[0].value : '',
                    // Set a default password or handle it as a social login.
                    // For social logins, you often don't store a password, but if your schema requires it,
                    // generate a strong random one or mark it as a social account.
                    password: '', // Password will not be used for social login
                    role: 'event_attendee', // Default role for new users
                    isVerified: true, // Social logins are considered verified
                    verificationCode: null,
                } as UserInsert); // Cast to UserInsert as some fields might be optional for social login

                if (!user) {
                    return done(new Error("Failed to create user during Google OAuth."), undefined);
                }
            }

            // If user exists or was created, pass them to Passport
            done(null, user);

        } catch (error: any) {
            done(error, undefined);
        }
    }));

// Serialize and deserialize user (optional if using JWT, but good practice for session-based auth)
// Since we are using JWT, session: false is set in passport.authenticate in the router.
// If you were to use sessions, you would need these:
/*
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
    try {
        const user = await UserService.getUserById(id);
        done(null, user);
    } catch (error) {
        done(error, undefined);
    }
});
*/

export default passport;