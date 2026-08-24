import pg from 'pg';
const { Pool } = pg;

const connectionString = "postgresql://neondb_owner:npg_2dce7SYKngQb@ep-flat-band-aysj548e.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({ connectionString });

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error("Error connecting:", err.message);
    process.exit(1);
  } else {
    console.log("Success:", res.rows);
    process.exit(0);
  }
});
