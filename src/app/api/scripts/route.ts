import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * SCRIPT EXECUTION API FOR MINT DATABASE OPERATIONS
 *
 * Allows running predefined scripts for CRUD operations on the mint database
 * Target Tables: profiles, tasks (representing mihle-matimba schema)
 *
 * Available Scripts:
 * - create_profile: Insert new profile
 * - update_profile: Update existing profile
 * - delete_profile: Remove profile
 * - create_task: Insert new task
 * - update_task: Update existing task
 * - delete_task: Remove task
 * - get_profiles: Fetch all profiles
 * - get_tasks: Fetch all tasks
 * - get_profile_by_id: Fetch specific profile
 * - get_task_by_id: Fetch specific task
 */

type SupabaseType = SupabaseClient

// Profile data types
interface ProfileData {
  email: string
  first_name: string
  last_name: string
  role: string
  role_id: string
  position: string
  id?: string
}

// Task data types
interface TaskData {
  title: string
  description?: string
  status: string
  assigned_to?: string
  priority: string
  due_date?: string
  id?: string
}

const scripts = {
  // Profile operations
  create_profile: async (supabase: SupabaseType, data: ProfileData) => {
    const { data: result, error } = await supabase
      .from('profiles')
      .insert(data)
      .select()
    if (error) throw error
    return { success: true, data: result, message: "Profile created successfully" }
  },

  update_profile: async (supabase: SupabaseType, data: ProfileData & { id: string }) => {
    const { id, ...updateData } = data
    const { data: result, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
    if (error) throw error
    return { success: true, data: result, message: "Profile updated successfully" }
  },

  delete_profile: async (supabase: SupabaseType, data: { id: string }) => {
    const { data: result, error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', data.id)
    if (error) throw error
    return { success: true, data: result, message: "Profile deleted successfully" }
  },

  get_profiles: async (supabase: SupabaseType) => {
    const { data: result, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: result, message: `Found ${result.length} profiles` }
  },

  get_profile_by_id: async (supabase: SupabaseType, data: { id: string }) => {
    const { data: result, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.id)
      .single()
    if (error) throw error
    return { success: true, data: result, message: "Profile retrieved successfully" }
  },

  // Task operations
  create_task: async (supabase: SupabaseType, data: TaskData) => {
    const { data: result, error } = await supabase
      .from('tasks')
      .insert(data)
      .select()
    if (error) throw error
    return { success: true, data: result, message: "Task created successfully" }
  },

  update_task: async (supabase: SupabaseType, data: TaskData & { id: string }) => {
    const { id, ...updateData } = data
    const { data: result, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
    if (error) throw error
    return { success: true, data: result, message: "Task updated successfully" }
  },

  delete_task: async (supabase: SupabaseType, data: { id: string }) => {
    const { data: result, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', data.id)
    if (error) throw error
    return { success: true, data: result, message: "Task deleted successfully" }
  },

  get_tasks: async (supabase: SupabaseType) => {
    const { data: result, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: result, message: `Found ${result.length} tasks` }
  },

  get_task_by_id: async (supabase: SupabaseType, data: { id: string }) => {
    const { data: result, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', data.id)
      .single()
    if (error) throw error
    return { success: true, data: result, message: "Task retrieved successfully" }
  }

  // Smart scheduling: assign unassigned tasks to users with least workload
  ,smart_schedule: async (supabase: SupabaseType) => {
    // 1. Get all users
    const { data: users, error: usersError } = await supabase.from('profiles').select('id, first_name, last_name')
    if (usersError) throw usersError
    if (!users || users.length === 0) return { success: false, message: "No users found" }

    // 2. Get all unassigned tasks
    const { data: tasks, error: tasksError } = await supabase.from('tasks').select('*').is('assigned_to', null)
    if (tasksError) throw tasksError
    if (!tasks || tasks.length === 0) return { success: true, message: "No unassigned tasks" }

    // 3. Get current workload for each user (number of assigned tasks)
    const { data: allTasks, error: allTasksError } = await supabase.from('tasks').select('id, assigned_to')
    if (allTasksError) throw allTasksError
    const workload: Record<string, number> = {}
    users.forEach(u => { workload[u.id] = 0 })
    allTasks.forEach(t => { if (t.assigned_to && workload[t.assigned_to] !== undefined) workload[t.assigned_to]++ })

    // 4. Assign each unassigned task to the user with the least workload
    const updates = []
    for (const task of tasks) {
      // Find user with min workload
      let minUser = users[0]
      for (const user of users) {
        if (workload[user.id] < workload[minUser.id]) minUser = user
      }
      // Assign task
      updates.push(
        supabase.from('tasks').update({ assigned_to: minUser.id }).eq('id', task.id)
      )
      workload[minUser.id]++
    }
    // Wait for all updates
    await Promise.all(updates)
    return { success: true, message: `Assigned ${tasks.length} tasks using smart schedule` }
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { script, data = {} } = body

    if (!script || !scripts[script as keyof typeof scripts]) {
      return NextResponse.json({
        error: "Invalid script",
        available_scripts: Object.keys(scripts)
      }, { status: 400 })
    }

    const result = await scripts[script as keyof typeof scripts](supabase, data)

    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: message, success: false }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "MINT Database Script Runner API",
    available_scripts: Object.keys(scripts),
    usage: {
      endpoint: "POST /api/scripts",
      body: {
        script: "script_name",
        data: { /* script parameters */ }
      }
    },
    scripts: {
      profiles: ["create_profile", "update_profile", "delete_profile", "get_profiles", "get_profile_by_id"],
      tasks: ["create_task", "update_task", "delete_task", "get_tasks", "get_task_by_id"]
      ,smart: ["smart_schedule"]
    }
  })
}