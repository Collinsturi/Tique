import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import "dotenv/config";

export const checkRoles = (
    requiredRole: "admin" | "customer" | "check_in_staff"
) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Unauthorized: No token provided" });
            return;
        }

        const token = authHeader.split(" ")[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

            // Attach user info to request
            (req as any).user = decoded;

            if (typeof decoded === "object" && decoded !== null && "role" in decoded) {
                const userRole = (decoded as any).role;

                // Allow if user has the required role or is an admin
                if (userRole === requiredRole || userRole === "admin") {
                    next();
                    return;
                }

                res.status(403).json({ message: "Forbidden: Insufficient role" });
                return;
            } else {
                res.status(401).json({ message: "Invalid token payload" });
                return;
            }
        } catch (error) {
            res.status(401).json({ message: "Invalid token" });
            return;
        }
    };
};

// Export middleware for specific roles
export const adminRoleAuth = checkRoles("admin");
export const userRoleAuth = checkRoles("customer");
export const checkInStaffRoleAuth = checkRoles("check_in_staff");
