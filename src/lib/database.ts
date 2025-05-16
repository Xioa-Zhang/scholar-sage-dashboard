
import Database from 'better-sqlite3';
import { useState, useEffect } from 'react';

// Initialize the database
let db: any = null;

try {
  // In production, we'd use a proper file path
  db = new Database(':memory:');
  
  // Create tables if they don't exist
  // Subjects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Notes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER,
      title TEXT NOT NULL,
      content TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subject_id) REFERENCES subjects (id)
    )
  `);

  // Flashcards table
  db.exec(`
    CREATE TABLE IF NOT EXISTS flashcards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_reviewed TIMESTAMP,
      FOREIGN KEY (subject_id) REFERENCES subjects (id)
    )
  `);

  // Tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      due_date TIMESTAMP,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      tag TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP
    )
  `);

  // Competitions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS competitions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      start_date TIMESTAMP,
      end_date TIMESTAMP,
      location TEXT,
      category TEXT,
      url TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Files table
  db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      path TEXT NOT NULL,
      type TEXT,
      size INTEGER,
      subject_id INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subject_id) REFERENCES subjects (id)
    )
  `);
} catch (error) {
  console.error('Failed to initialize database:', error);
}

// Subject CRUD operations
export function createSubject(name: string, description: string = "", color: string = "#4F46E5") {
  const stmt = db.prepare('INSERT INTO subjects (name, description, color) VALUES (?, ?, ?)');
  return stmt.run(name, description, color).lastInsertRowid;
}

export function getSubjects() {
  return db.prepare('SELECT * FROM subjects ORDER BY name').all();
}

export function getSubject(id: number) {
  return db.prepare('SELECT * FROM subjects WHERE id = ?').get(id);
}

export function updateSubject(id: number, name: string, description: string, color: string) {
  const stmt = db.prepare('UPDATE subjects SET name = ?, description = ?, color = ? WHERE id = ?');
  return stmt.run(name, description, color, id);
}

export function deleteSubject(id: number) {
  const stmt = db.prepare('DELETE FROM subjects WHERE id = ?');
  return stmt.run(id);
}

// Note CRUD operations
export function createNote(subject_id: number, title: string, content: string = "") {
  const stmt = db.prepare('INSERT INTO notes (subject_id, title, content) VALUES (?, ?, ?)');
  return stmt.run(subject_id, title, content).lastInsertRowid;
}

export function getNotes(subject_id?: number) {
  if (subject_id) {
    return db.prepare('SELECT * FROM notes WHERE subject_id = ? ORDER BY created_at DESC').all(subject_id);
  }
  return db.prepare('SELECT notes.*, subjects.name as subject_name FROM notes JOIN subjects ON notes.subject_id = subjects.id ORDER BY created_at DESC').all();
}

export function getNote(id: number) {
  return db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
}

export function updateNote(id: number, title: string, content: string) {
  const stmt = db.prepare('UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  return stmt.run(title, content, id);
}

export function deleteNote(id: number) {
  const stmt = db.prepare('DELETE FROM notes WHERE id = ?');
  return stmt.run(id);
}

// Flashcard CRUD operations
export function createFlashcard(subject_id: number, question: string, answer: string) {
  const stmt = db.prepare('INSERT INTO flashcards (subject_id, question, answer) VALUES (?, ?, ?)');
  return stmt.run(subject_id, question, answer).lastInsertRowid;
}

export function getFlashcards(subject_id?: number) {
  if (subject_id) {
    return db.prepare('SELECT * FROM flashcards WHERE subject_id = ?').all(subject_id);
  }
  return db.prepare('SELECT flashcards.*, subjects.name as subject_name FROM flashcards JOIN subjects ON flashcards.subject_id = subjects.id').all();
}

export function getFlashcard(id: number) {
  return db.prepare('SELECT * FROM flashcards WHERE id = ?').get(id);
}

export function updateFlashcard(id: number, question: string, answer: string) {
  const stmt = db.prepare('UPDATE flashcards SET question = ?, answer = ? WHERE id = ?');
  return stmt.run(question, answer, id);
}

export function updateFlashcardReview(id: number) {
  const stmt = db.prepare('UPDATE flashcards SET last_reviewed = CURRENT_TIMESTAMP WHERE id = ?');
  return stmt.run(id);
}

export function deleteFlashcard(id: number) {
  const stmt = db.prepare('DELETE FROM flashcards WHERE id = ?');
  return stmt.run(id);
}

// Task CRUD operations
export function createTask(title: string, description: string = "", due_date: string = "", priority: string = "medium", tag: string = "") {
  const stmt = db.prepare('INSERT INTO tasks (title, description, due_date, priority, tag) VALUES (?, ?, ?, ?, ?)');
  return stmt.run(title, description, due_date, priority, tag).lastInsertRowid;
}

export function getTasks(tag?: string, status?: string) {
  if (tag && status) {
    return db.prepare('SELECT * FROM tasks WHERE tag = ? AND status = ? ORDER BY due_date').all(tag, status);
  }
  if (tag) {
    return db.prepare('SELECT * FROM tasks WHERE tag = ? ORDER BY due_date').all(tag);
  }
  if (status) {
    return db.prepare('SELECT * FROM tasks WHERE status = ? ORDER BY due_date').all(status);
  }
  return db.prepare('SELECT * FROM tasks ORDER BY due_date').all();
}

export function getTask(id: number) {
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
}

export function updateTask(id: number, title: string, description: string, due_date: string, priority: string, tag: string) {
  const stmt = db.prepare('UPDATE tasks SET title = ?, description = ?, due_date = ?, priority = ?, tag = ? WHERE id = ?');
  return stmt.run(title, description, due_date, priority, tag, id);
}

export function updateTaskStatus(id: number, status: string) {
  const completed_at = status === 'completed' ? 'CURRENT_TIMESTAMP' : null;
  const stmt = db.prepare('UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?');
  return stmt.run(status, completed_at, id);
}

export function deleteTask(id: number) {
  const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
  return stmt.run(id);
}

// Competition CRUD operations
export function createCompetition(name: string, description: string = "", start_date: string = "", end_date: string = "", location: string = "", category: string = "", url: string = "", notes: string = "") {
  const stmt = db.prepare('INSERT INTO competitions (name, description, start_date, end_date, location, category, url, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  return stmt.run(name, description, start_date, end_date, location, category, url, notes).lastInsertRowid;
}

export function getCompetitions(category?: string) {
  if (category) {
    return db.prepare('SELECT * FROM competitions WHERE category = ? ORDER BY start_date').all(category);
  }
  return db.prepare('SELECT * FROM competitions ORDER BY start_date').all();
}

export function getCompetition(id: number) {
  return db.prepare('SELECT * FROM competitions WHERE id = ?').get(id);
}

export function updateCompetition(id: number, name: string, description: string, start_date: string, end_date: string, location: string, category: string, url: string, notes: string) {
  const stmt = db.prepare('UPDATE competitions SET name = ?, description = ?, start_date = ?, end_date = ?, location = ?, category = ?, url = ?, notes = ? WHERE id = ?');
  return stmt.run(name, description, start_date, end_date, location, category, url, notes, id);
}

export function deleteCompetition(id: number) {
  const stmt = db.prepare('DELETE FROM competitions WHERE id = ?');
  return stmt.run(id);
}

// File CRUD operations
export function createFile(name: string, path: string, type: string, size: number, subject_id?: number) {
  const stmt = db.prepare('INSERT INTO files (name, path, type, size, subject_id) VALUES (?, ?, ?, ?, ?)');
  return stmt.run(name, path, type, size, subject_id || null).lastInsertRowid;
}

export function getFiles(subject_id?: number) {
  if (subject_id) {
    return db.prepare('SELECT * FROM files WHERE subject_id = ? ORDER BY created_at DESC').all(subject_id);
  }
  return db.prepare('SELECT files.*, subjects.name as subject_name FROM files LEFT JOIN subjects ON files.subject_id = subjects.id ORDER BY created_at DESC').all();
}

export function getFile(id: number) {
  return db.prepare('SELECT * FROM files WHERE id = ?').get(id);
}

export function updateFile(id: number, name: string, path: string, subject_id?: number) {
  const stmt = db.prepare('UPDATE files SET name = ?, path = ?, subject_id = ? WHERE id = ?');
  return stmt.run(name, path, subject_id || null, id);
}

export function deleteFile(id: number) {
  const stmt = db.prepare('DELETE FROM files WHERE id = ?');
  return stmt.run(id);
}

// Custom hooks for database operations
export function useSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setSubjects(getSubjects());
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { subjects, loading };
}

export function useNotes(subjectId?: number) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setNotes(getNotes(subjectId));
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  return { notes, loading };
}

export function useTasks(tag?: string, status?: string) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setTasks(getTasks(tag, status));
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [tag, status]);

  return { tasks, loading };
}

export function useCompetitions(category?: string) {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setCompetitions(getCompetitions(category));
    } catch (error) {
      console.error('Error fetching competitions:', error);
    } finally {
      setLoading(false);
    }
  }, [category]);

  return { competitions, loading };
}

export function useFiles(subjectId?: number) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setFiles(getFiles(subjectId));
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  return { files, loading };
}
