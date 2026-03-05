import axios from 'axios';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Validate token with Spring Boot
    const response = await axios.post(
      `${process.env.AUTH_SERVICE_URL}/auth/validate`,
      {},
      {
        headers: {
          Authorization: authHeader,
        },
      }
    );

    if (!response.data.valid) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Attach user info to request
    req.user = {
      userId: response.data.userId,
      email: response.data.email,
      role: response.data.role,
    };

    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};