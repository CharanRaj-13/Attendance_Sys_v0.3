const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
});

function generateStaffId(name) {
    const initials = name.slice(0, 2).toUpperCase();
    const randomNumbers = Math.floor(100 + Math.random() * 900);
    return `${initials}${randomNumbers}`;
}

// Signup endpoint
app.post('/signup', async (req, res) => {
    const { name, subject, classes, pin } = req.body;
    try {
        const staffId = generateStaffId(name);
        await pool.query(
            'INSERT INTO staffs (staff_id, name, subject, pin) VALUES (?, ?, ?, ?)',
            [staffId, name, subject, pin]
        );
        for (const className of classes) {
            await pool.query(
                'INSERT INTO classes (class_name, staff_id) VALUES (?, ?)',
                [className, staffId]
            );
        }
        res.json({ message: 'Signup successful', staffId: staffId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Signup failed' });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { staffId, className, pin } = req.body;
    try {
        const [staffRows] = await pool.query(
            'SELECT * FROM staffs WHERE staff_id = ? AND pin = ?',
            [staffId, pin]
        );
        if (staffRows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const [classRows] = await pool.query(
            'SELECT * FROM classes WHERE staff_id = ? AND class_name = ?',
            [staffId, className]
        );
        if (classRows.length === 0) {
            return res.status(401).json({ error: 'Invalid class' });
        }

        res.json({ message: 'Login successful', staff: staffRows[0], class: classRows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get students for a specific class
app.get('/students/:classId', async (req, res) => {
    const { classId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM students WHERE class_id = ? ORDER BY registration_number ASC', [classId]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// Add a new student
app.post('/students', async (req, res) => {
    const { name, registration_number, class_id } = req.body;
    try {
        await pool.query('INSERT INTO students (name, registration_number, class_id) VALUES (?, ?, ?)', [name, registration_number, class_id]);
        res.json({ message: 'Student added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add student' });
    }
});

// Save attendance
app.post('/attendance', async (req, res) => {
    const { attendance } = req.body;
    try {
        for (const record of attendance) {
            await pool.query(
                'INSERT INTO attendances (student_id, class_id, attendance_date, present) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE present = ?',
                [record.student_id, record.class_id, record.date, record.present, record.present]
            );
        }
        res.json({ message: 'Attendance saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save attendance' });
    }
});

// Delete a student
app.delete('/students/:studentId', async (req, res) => {
    const { studentId } = req.params;
    try {
        await pool.query('DELETE FROM students WHERE student_id = ?', [studentId]);
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete student' });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));