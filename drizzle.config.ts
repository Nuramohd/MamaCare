import 'dotenv/config'; // <-- THIS MUST BE THE FIRST LINE
import { defineConfig } from 'drizzle-kit';

// Add this line to debug. It will print the URL to your console.
console.log('Database URL being used:', process.env.DATABASE_URL);

export default defineConfig({
  schema: './server/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
