// frontend/src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function Dashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const { staff, class: currentClass } = location.state;
    const [students, setStudents] = useState([]);
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentRegNo, setNewStudentRegNo] = useState('');
    const [attendance, setAttendance] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/students/${currentClass.class_id}`);
            setStudents(response.data);
            const initialAttendance = {};
            response.data.forEach(student => {
                initialAttendance[student.student_id] = true;
            });
            setAttendance(initialAttendance);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch students');
        }
    };

    const handleAddStudent = async () => {
        if (!newStudentName || !newStudentRegNo) return;
        try {
            await axios.post('http://localhost:5000/students', {
                name: newStudentName,
                registration_number: newStudentRegNo,
                class_id: currentClass.class_id,
            });
            fetchStudents();
            setNewStudentName('');
            setNewStudentRegNo('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add student');
        }
    };

    const handleDeleteStudent = async (studentId) => {
        try {
            await axios.delete(`http://localhost:5000/students/${studentId}`);
            fetchStudents();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete student');
        }
    };

    const toggleAttendance = (studentId) => {
        setAttendance({ ...attendance, [studentId]: !attendance[studentId] });
    };

    const saveAttendance = async () => {
        try {
            const attendanceData = Object.keys(attendance).map(studentId => ({
                student_id: parseInt(studentId),
                class_id: currentClass.class_id,
                present: attendance[studentId],
                date: selectedDate,
            }));
            await axios.post('http://localhost:5000/attendance', { attendance: attendanceData });
            setEditMode(false);
            setError('Attendance saved successfully');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save attendance');
        }
    };

    const editAttendance = () => {
        setEditMode(true);
    };

    const exportToExcel = () => {
        const presentCount = Object.values(attendance).filter(present => present).length;
        const absentCount = students.length - presentCount;
        const data = [
            ...students.map(student => ({
                'Registration Number': student.registration_number,
                'Student Name': student.name,
                'Attendance': attendance[student.student_id] ? 'Present' : 'Absent',
            })),
            {},
            { 'Registration Number': 'Total Students', 'Student Name': students.length, 'Attendance': '' },
            { 'Registration Number': 'Present Students', 'Student Name': presentCount, 'Attendance': '' },
            { 'Registration Number': 'Absent Students', 'Student Name': absentCount, 'Attendance': '' },
        ];
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
        XLSX.writeFile(workbook, 'attendance.xlsx');
    };

    return (
        <div className="p-4">
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded mr-2"
                >
                    Back
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                    Sign Out
                </button>
            </div>
            <h2 className="text-2xl font-semibold mb-4">Dashboard - {currentClass.class_name}</h2>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Student Name"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="border p-2 mr-2"
                />
                <input
                    type="text"
                    placeholder="Registration Number"
                    value={newStudentRegNo}
                    onChange={(e) => setNewStudentRegNo(e.target.value)}
                    className="border p-2 mr-2"
                />
                <button onClick={handleAddStudent} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Add Student
                </button>
            </div>
            <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} />
            <table className="min-w-full leading-normal">
                <thead>
                    <tr>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Student Name
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Registration Number
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Attendance
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {students.map(student => (
                        <tr key={student.student_id}>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                {student.name}
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                {student.registration_number}
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <button
                                    onClick={() => toggleAttendance(student.student_id)}
                                    className={`px-4 py-2 rounded ${attendance[student.student_id] ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                                >
                                    {attendance[student.student_id] ? 'Present' : 'Absent'}
                                </button>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <button
                                    onClick={() => handleDeleteStudent(student.student_id)}
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                </table>
                <div className="mt-4">
                    {!editMode && (
                        <button onClick={editAttendance} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-2">
                            Edit Attendance
                        </button>
                    )}
                    <button onClick={saveAttendance} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
                        Save Attendance
                    </button>
                    <button onClick={exportToExcel} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Export Excel
                    </button>
                </div>
            </div>
        );
}

export default Dashboard;