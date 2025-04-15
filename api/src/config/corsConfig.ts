const devOrigins = ['http://localhost:5173', 'http://localhost:5174'];
const prodOrigins =
  process.env.ALLOWED_ORIGINS?.split(',')
    .map(origin => origin.trim())
    .filter(Boolean) || [];

const allowedOrigins =
  process.env.NODE_ENV === 'production' ? prodOrigins : devOrigins;

if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  console.error(
    'FATAL CORS ERROR: ALLOWED_ORIGINS env var is not set or empty in production!'
  );
  throw new Error('Production CORS origins are not configured!');
}

export const corsOptionsBase = {
  origin: allowedOrigins,
  credentials: true,
};

// console.log(`CORS allowed origins: ${JSON.stringify(allowedOrigins)}`); // Uncomment for debugging
