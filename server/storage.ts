import { type Teacher, type InsertTeacher } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getTeacher(id: string): Promise<Teacher | undefined>;
  getTeacherByEmployeeId(employeeId: string): Promise<Teacher | undefined>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  updateTeacher(id: string, updates: Partial<InsertTeacher>): Promise<Teacher | undefined>;
  deleteTeacher(id: string): Promise<boolean>;
  getAllTeachers(): Promise<Teacher[]>;
  getRecentTeachers(limit?: number): Promise<Teacher[]>;
}

export class MemStorage implements IStorage {
  private teachers: Map<string, Teacher>;

  constructor() {
    this.teachers = new Map();
  }

  async getTeacher(id: string): Promise<Teacher | undefined> {
    return this.teachers.get(id);
  }

  async getTeacherByEmployeeId(employeeId: string): Promise<Teacher | undefined> {
    return Array.from(this.teachers.values()).find(
      (teacher) => teacher.employeeId === employeeId,
    );
  }

  async createTeacher(insertTeacher: InsertTeacher): Promise<Teacher> {
    const id = randomUUID();
    const teacher: Teacher = { 
      id,
      name: insertTeacher.name,
      department: insertTeacher.department,
      employeeId: insertTeacher.employeeId,
      designation: insertTeacher.designation || null,
      phone: insertTeacher.phone || null,
      institution: insertTeacher.institution || null,
      photoUrl: insertTeacher.photoUrl || null,
      template: insertTeacher.template || "classic-blue",
      createdAt: new Date()
    };
    this.teachers.set(id, teacher);
    return teacher;
  }

  async updateTeacher(id: string, updates: Partial<InsertTeacher>): Promise<Teacher | undefined> {
    const teacher = this.teachers.get(id);
    if (!teacher) return undefined;

    // Ensure all fields are properly typed, converting undefined to null
    const processedUpdates: Partial<Teacher> = {};
    if (updates.name !== undefined) processedUpdates.name = updates.name;
    if (updates.department !== undefined) processedUpdates.department = updates.department;
    if (updates.employeeId !== undefined) processedUpdates.employeeId = updates.employeeId;
    if (updates.designation !== undefined) processedUpdates.designation = updates.designation || null;
    if (updates.phone !== undefined) processedUpdates.phone = updates.phone || null;
    if (updates.institution !== undefined) processedUpdates.institution = updates.institution || null;
    if (updates.photoUrl !== undefined) processedUpdates.photoUrl = updates.photoUrl || null;
    if (updates.template !== undefined) processedUpdates.template = updates.template || "classic-blue";

    const updatedTeacher = { ...teacher, ...processedUpdates };
    this.teachers.set(id, updatedTeacher);
    return updatedTeacher;
  }

  async deleteTeacher(id: string): Promise<boolean> {
    return this.teachers.delete(id);
  }

  async getAllTeachers(): Promise<Teacher[]> {
    return Array.from(this.teachers.values())
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async getRecentTeachers(limit: number = 10): Promise<Teacher[]> {
    const teachers = await this.getAllTeachers();
    return teachers.slice(0, limit);
  }
}

export const storage = new MemStorage();
