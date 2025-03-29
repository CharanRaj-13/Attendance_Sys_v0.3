# Attendance System

This is a web-based attendance system built with React for the frontend and Node.js/Express for the backend, using MySQL as the database.

## Prerequisites

* Node.js and npm (Node Package Manager)
* MySQL Server

## Setup

1.  **Clone the repository:**

    ```bash
    git clone <your-repository-url>
    cd <your-repository-directory>
    ```

2.  **Backend Setup:**

    * Navigate to the backend directory:

        ```bash
        cd backend
        ```

    * Install backend dependencies:

        ```bash
        npm install express mysql2 dotenv cors
        ```

    * Create a `.env` file in the backend directory with your MySQL database credentials:

        ```
        DB_HOST=your_host
        DB_USER=your_user
        DB_PASSWORD=your_password
        DB_DATABASE=your_database
        DB_PORT=your_port
        ```

    * Run the server:

        ```bash
        npm start
        ```

3.  **Frontend Setup:**

    * Navigate to the frontend directory:

        ```bash
        cd ../frontend
        ```

    * Install frontend dependencies:

        ```bash
        npm install react react-dom react-router-dom react-datepicker axios xlsx tailwindcss postcss autoprefixer react-icons
        npx tailwindcss init -p
        ```

    * Configure Tailwind CSS by adding these lines to the `content` array of your `tailwind.config.js` file:

        ```javascript
        module.exports = {
          content: [
            "./src/**/*.{js,jsx,ts,tsx}",
          ],
          theme: {
            extend: {},
          },
          plugins: [],
        }
        ```

    * Add the tailwind directives to your `index.css` file.

        ```css
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
        ```

    * Run the frontend application:

        ```bash
        npm start
        ```

    * The frontend will be accessible at `http://localhost:3000`.

## Database Setup

1.  Create a MySQL database with the name specified in your `.env` file.

2.  Run the SQL script (located in `backend/database.sql` or similar) to create the necessary tables.

    ```sql
    -- Example database.sql content:
    CREATE DATABASE attendance_db;
    USE attendance_db;

    CREATE TABLE staffs (
        staff_id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        pin VARCHAR(4) NOT NULL,
        subject VARCHAR(255)
    );

    CREATE TABLE classes (
        class_id INT AUTO_INCREMENT PRIMARY KEY,
        class_name VARCHAR(255) NOT NULL,
        staff_id VARCHAR(255),
        FOREIGN KEY (staff_id) REFERENCES staffs(staff_id)
    );

    -- ... other table creation statements ...
    ```

## Usage

1.  Open your browser and navigate to `http://localhost:3000`.

2.  Use the signup page to create a new staff account.

3.  Login with the created staff account.

4.  Use the dashboard to manage attendance.

## Important notes

* Make sure your MySQL server is running before you start the backend server.
* Adjust the `.env` file with your correct database credentials.
* The port that the frontend and backend run on can be modified if needed.
* For production, use a process manager like PM2 to keep the backend server running.
* For a production build of the frontend, use `npm run build` in the frontend directory.
* Ensure Node.js and npm are correctly installed and configured.
* Tailwind CSS is configured using the `npx tailwindcss init -p` command and by adding the content paths to the tailwind.config.js file.
* `react-datepicker` is used for date selection, `xlsx` for excel file manipulation, `axios` for http requests, and `react-icons` for icons.
