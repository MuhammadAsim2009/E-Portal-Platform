# PostgreSQL Database Setup Guide

Since this platform utilizes PostgreSQL (via `node-postgres`) to manage all data relationships securely, you must have a PostgreSQL instance running either locally or via a cloud provider like AWS RDS.

Follow one of the two guides below to get your database up and running.

---

## Option 1: Local Installation (Recommended for Development)

### Windows
1. **Download PostgreSQL**: Visit the [official EDB download page](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads) and download the latest version for Windows.
2. **Install**: Run the installer. 
   - Accept the default options. 
   - **Important**: When prompted for a password for the `postgres` superuser, enter a memorable password (e.g., `admin` or `root`). You will need this for your `.env` file!
   - Keep the default port as `5432`.
3. **Verify Installation**: Open your Start Menu and search for **pgAdmin 4** (the visual interface for Postgres). Open it, wait for it to load, and enter your master password.
4. **Create the Database**:
   - Right-click on "Databases" -> Create -> Database.
   - Name it exactly: `e_portal_db`.
   - Click Save.
5. **Apply the Schema**:
   - Right-click on `e_portal_db` and select **Query Tool**.
   - Open our project's `database/schema.sql` file in your code editor, copy all of the text, and paste it into the Query Tool text area in pgAdmin.
   - Click the "Play" button (Execute) at the top of the Query Tool.
   - *Result*: Your tables (`users`, `students`, `courses`, etc.) will be created successfully!

### macOS (via Homebrew)
1. Open Terminal and run: `brew install postgresql`
2. Start the service: `brew services start postgresql`
3. Create the database: `createdb e_portal_db`
4. Apply the schema: `psql -d e_portal_db -f ./database/schema.sql`

---

## Option 2: AWS RDS (Recommended for Production)

If you'd prefer to host your database in the cloud, Amazon Web Services (AWS) provides a managed service:

1. Log into your [AWS Management Console](https://console.aws.amazon.com/).
2. Navigate to **RDS** (Relational Database Service).
3. Click **Create database**.
4. Select **Standard create** and choose **PostgreSQL** as the engine.
5. **Templates**: Choose **Free tier** (if available) for development or testing.
6. **Settings**:
   - DB instance identifier: `e-portal-db-instance`
   - Master username: `postgres`
   - Master password: Create a secure password (store this safely).
7. **Connectivity**:
   - Public access: Select **Yes** (required if you are connecting from your local dev machine).
   - Create a new VPC security group or use an existing one ensuring Port `5432` is open to inbound traffic (0.0.0.0/0 for testing, or your specific IP).
8. Click **Create database** (this takes about 5-10 minutes to provision).
9. Once available, click into the database instance to find the **Endpoint** URL.

**To apply the schema on AWS RDS**:
You will need to connect via a tool like pgAdmin 4 or DBeaver.
- **Host**: Your AWS RDS Endpoint URL
- **Port**: `5432`
- **Database**: `postgres` (AWS creates a default `postgres` db)
- **Username**: `postgres`
- **Password**: *[Your chosen password]*

Once connected, run `CREATE DATABASE e_portal_db;`, reconnect to the new `e_portal_db`, and execute the `database/schema.sql` script exactly as in the local guide.

---

## Final Step: Connect the Application

Whichever option you chose, you must update the `.env` file in the `server/` directory:

```env
# server/.env

# Use "localhost" if you installed locally, OR paste your AWS RDS Endpoint URL here.
DB_HOST=localhost 

# Update this to match the password you set during installation
DB_PASSWORD=your_password_here 

DB_USER=postgres
DB_PORT=5432
DB_NAME=e_portal_db
```

Once updated, running `npm run dev` in the `server` folder will successfully connect to your database!
