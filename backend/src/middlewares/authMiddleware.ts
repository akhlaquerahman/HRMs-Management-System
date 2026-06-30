import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend the default Express Request to include our custom user data
export interface AuthRequest extends Request {
  user?: { id: string; role: string; email: string };
}

// Middleware function to check if the user is logged in
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Extract the token from the "Authorization: Bearer <token>" header
  const token = req.headers.authorization?.split(' ')[1];
  
  // If there is no token, block the request and return an error
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
  }

  try {
    // Verify the token using our secret key to make sure it's valid and hasn't been tampered with
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    
    // Attach the decoded user information to the request so other parts of the app can use it
    req.user = decoded;
    
    // Move on to the next function/route handler
    next();
  } catch (error) {
    // If the token is expired or invalid, block the request
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }
};
