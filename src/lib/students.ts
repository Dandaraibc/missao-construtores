import { TeamSlug } from "@/types";

export interface Student {
  id: string;
  name: string;
  teamSlug: TeamSlug;
  createdAt: string;
}

const STORAGE_KEY = "missao-students";

export function getStudents(): Student[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStudents(students: Student[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

export function addStudent(name: string, teamSlug: TeamSlug): Student {
  const students = getStudents();
  const student: Student = {
    id: crypto.randomUUID(),
    name: name.trim(),
    teamSlug,
    createdAt: new Date().toISOString(),
  };
  students.push(student);
  saveStudents(students);
  return student;
}

export function updateStudent(id: string, data: Partial<Pick<Student, "name" | "teamSlug">>) {
  const students = getStudents();
  const idx = students.findIndex((s) => s.id === id);
  if (idx === -1) return;
  students[idx] = { ...students[idx], ...data };
  saveStudents(students);
}

export function removeStudent(id: string) {
  const students = getStudents().filter((s) => s.id !== id);
  saveStudents(students);
}

export function findStudentByName(name: string): Student | undefined {
  const normalized = name.trim().toLowerCase();
  return getStudents().find((s) => s.name.toLowerCase() === normalized);
}

export function getStudentsByTeam(teamSlug: TeamSlug): Student[] {
  return getStudents().filter((s) => s.teamSlug === teamSlug);
}
