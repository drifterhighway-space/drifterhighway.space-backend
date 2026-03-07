/**
 * Migration initialization script
 * Loads the migration from src/migrations/ and executes against MySQL
 */

const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const MIGRATIONS_DIR = path.join(__dirname, "..", "src", "migrations");

async function main() {
    // Get database configuration from environment
    const host = process.env.DB_HOST || "localhost";
    const port = process.env.DB_PORT || 3306;
    const database = process.env.DB_DATABASE || "drifterhighway";
    const user = process.env.DB_USER || "root";
    const password = process.env.DB_PASS || "";

    if (!host || !database) {
        console.error("Error: Database configuration not found in .env file");
        console.error("Required: DB_HOST, DB_DATABASE");
        process.exit(1);
    }

    // Connect to MySQL
    let pool;
    try {
        console.log(`Connecting to MySQL at ${host}:${port}/${database}`);
        pool = await mysql.createPool({
            host,
            port,
            user,
            password,
            database,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });

        console.log("Connected to MySQL successfully");

        // Check if migrations directory exists
        if (!fs.existsSync(MIGRATIONS_DIR)) {
            console.log(
                `Warning: Migrations directory not found at ${MIGRATIONS_DIR}`,
            );
            console.log("Creating migrations directory...");
            fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
        }

        // Get all migration files (sorted by name)
        const migrationFiles = fs
            .readdirSync(MIGRATIONS_DIR)
            .filter((file) => file.endsWith(".sql"))
            .sort();

        if (migrationFiles.length === 0) {
            console.log("No migration files found");
            process.exit(0);
        }

        console.log(`Found ${migrationFiles.length} migration(s):`);
        migrationFiles.forEach((file) => console.log(`  - ${file}`));

        // Apply migrations in order
        for (const file of migrationFiles) {
            const filePath = path.join(MIGRATIONS_DIR, file);
            console.log(`\nApplying migration: ${file}`);

            const sql = fs.readFileSync(filePath, "utf-8");

            // Execute the migration SQL
            try {
                const [results] = await pool.query(sql);
                console.log(`  ✓ Migration completed`);
            } catch (err) {
                console.error(`  ✗ Migration failed: ${err.message}`);
                process.exit(1);
            }
        }

        console.log("\nAll migrations applied successfully!");
    } catch (err) {
        console.error("Failed to connect to MySQL:", err.message);
        process.exit(1);
    } finally {
        // Close connection pool
        if (pool) {
            await pool.end();
            console.log("Database connection closed");
        }
    }
}

main().catch((err) => {
    console.error("Unexpected error:", err);
    process.exit(1);
});
