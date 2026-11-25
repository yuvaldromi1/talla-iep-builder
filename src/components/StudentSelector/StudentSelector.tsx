// src/components/StudentSelector/StudentSelector.tsx

import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { loadStudents, addStudent, selectStudent } from '../../features/students/store/studentsSlice';
import { getStudentStatus } from '../../features/students/utils/studentUtils';
import type { Student } from '../../features/students/models/types';
import '../../assets/styles/components/StudentSelector.css';

interface StudentSelectorProps {
    onStudentSelected?: (student: Student | null) => void;
    placeholder?: string;
    className?: string;
}

export function StudentSelector({
    onStudentSelected,
    placeholder = "בחר/י תלמיד/ה או הקלד/י שם חדש...",
    className = ""
}: StudentSelectorProps) {
    const dispatch = useDispatch();
    const { allStudents, selectedStudentId, isLoading } = useSelector((state: RootState) => state.students);

    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [showAddNew, setShowAddNew] = useState(false);
    const [newStudentName, setNewStudentName] = useState('');

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const newStudentInputRef = useRef<HTMLInputElement>(null);

    // טעינת רשימת תלמידים בהתחלה
    useEffect(() => {
        dispatch(loadStudents());
    }, [dispatch]);

    // סגירת הרשימה בלחיצה מחוץ לקומפוננטה
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setShowAddNew(false);
                setNewStudentName('');
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // מיקוד באינפוט החדש
    useEffect(() => {
        if (showAddNew && newStudentInputRef.current) {
            newStudentInputRef.current.focus();
        }
    }, [showAddNew]);

    // סינון תלמידים לפי חיפוש
    const filteredStudents = allStudents.filter(student =>
        student.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    // בחירת תלמיד
    const handleStudentSelect = (student: Student) => {
        dispatch(selectStudent(student.id));
        setSearchValue(student.name);
        setIsOpen(false);
        onStudentSelected?.(student);
    };

    // הוספת תלמיד חדש
    const handleAddNewStudent = () => {
        if (newStudentName.trim()) {
            dispatch(addStudent({ name: newStudentName.trim() }));
            setNewStudentName('');
            setShowAddNew(false);
            setIsOpen(false);
        }
    };

    // הצגת אינפוט תלמיד חדש
    const handleShowAddNew = () => {
        setShowAddNew(true);
        setIsOpen(false);
    };

    // ביטול הוספת תלמיד חדש
    const handleCancelAddNew = () => {
        setShowAddNew(false);
        setNewStudentName('');
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    // פתיחה/סגירה של הרשימה
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setSearchValue('');
        }
    };

    // טיפול בשינוי טקסט החיפוש
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);
        setIsOpen(true);
    };

    // אייקון סטטוס תלמיד
    const getStatusIcon = (student: Student) => {
        const status = getStudentStatus(student);
        switch (status) {
            case 'completed':
                return '🟢';
            case 'in-progress':
                return `🟡 ${student.progress}%`;
            case 'not-started':
                return '🔴';
            default:
                return '📊';
        }
    };

    // הצגת השם של התלמיד הנבחר
    const selectedStudent = allStudents.find(s => s.id === selectedStudentId);
    const displayValue = selectedStudent ? selectedStudent.name : searchValue;

    return (
        <div className={`student-selector ${className}`} ref={containerRef}>
            <div className="selector-label">
                <span className="label-text">תלמיד/ה:</span>
                <span className="label-icon">👤</span>
            </div>

            {/* אינפוט ראשי */}
            <div className="selector-input-container">
                <input
                    ref={inputRef}
                    type="text"
                    className="selector-input"
                    value={displayValue}
                    onChange={handleSearchChange}
                    onFocus={toggleDropdown}
                    placeholder={placeholder}
                    disabled={isLoading}
                />

                <button
                    type="button"
                    className="dropdown-toggle"
                    onClick={toggleDropdown}
                    disabled={isLoading}
                >
                    {isOpen ? '▲' : '▼'}
                </button>
            </div>

            {/* רשימת תלמידים */}
            {isOpen && (
                <div className="dropdown-menu">
                    {filteredStudents.length > 0 ? (
                        <>
                            {filteredStudents.map(student => (
                                <div
                                    key={student.id}
                                    className={`dropdown-item ${selectedStudentId === student.id ? 'selected' : ''}`}
                                    onClick={() => handleStudentSelect(student)}
                                >
                                    <span className="student-name">{student.name}</span>
                                    <span className="student-status">
                                        {getStatusIcon(student)}
                                    </span>
                                </div>
                            ))}

                            <div className="dropdown-divider"></div>
                        </>
                    ) : searchValue && (
                        <div className="dropdown-item no-results">
                            לא נמצאו תלמידים עם השם "{searchValue}"
                        </div>
                    )}

                    <div
                        className="dropdown-item add-new"
                        onClick={handleShowAddNew}
                    >
                        <span className="add-icon">➕</span>
                        <span>הוסף תלמיד חדש</span>
                    </div>
                </div>
            )}

            {/* אינפוט לתלמיד חדש */}
            {showAddNew && (
                <div className="add-new-container">
                    <div className="add-new-header">
                        <span>הוסף תלמיד חדש</span>
                    </div>

                    <div className="add-new-input-container">
                        <input
                            ref={newStudentInputRef}
                            type="text"
                            className="add-new-input"
                            value={newStudentName}
                            onChange={(e) => setNewStudentName(e.target.value)}
                            placeholder="שם התלמיד החדש..."
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleAddNewStudent();
                                } else if (e.key === 'Escape') {
                                    handleCancelAddNew();
                                }
                            }}
                        />
                    </div>

                    <div className="add-new-buttons">
                        <button
                            type="button"
                            className="btn-add"
                            onClick={handleAddNewStudent}
                            disabled={!newStudentName.trim()}
                        >
                            הוסף
                        </button>
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={handleCancelAddNew}
                        >
                            ביטול
                        </button>
                    </div>
                </div>
            )}

            {/* טעינה */}
            {isLoading && (
                <div className="loading-indicator">
                    <span>טוען תלמידים...</span>
                </div>
            )}
        </div>
    );
}