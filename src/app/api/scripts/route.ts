import { createClient } from "@/utils/supabase/server"
import { createMintClient } from "@/utils/supabase/mint-client"
import { NextResponse } from "next/server"
import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * SCRIPT EXECUTION API
 *
 * Supports two databases:
 *   db: "devhub"  (default) — DevHub Supabase (profiles, tasks)
 *   db: "mint"              — External MINT Supabase project
 *
 * POST /api/scripts
 * Body: { script: string, data?: object, db?: "devhub" | "mint" }
 */

type SupabaseType = SupabaseClient

// ─── Shared data types ────────────────────────────────────────────────────────

interface ProfileData {
  email: string
  first_name: string
  last_name: string
  role: string
  role_id: string
  position: string
  id?: string
}

interface TaskData {
  title: string
  description?: string
  status: string
  assigned_to?: string
  priority: string
  due_date?: string
  id?: string
}

// ─── DevHub scripts (profiles + tasks) ───────────────────────────────────────

const devhubScripts = {
  create_profile: async (supabase: SupabaseType, data: ProfileData) => {
    const { data: result, error } = await supabase.from("profiles").insert(data).select()
    if (error) throw error
    return { success: true, data: result, message: "Profile created successfully" }
  },

  update_profile: async (supabase: SupabaseType, data: ProfileData & { id: string }) => {
    const { id, ...updateData } = data
    const { data: result, error } = await supabase.from("profiles").update(updateData).eq("id", id).select()
    if (error) throw error
    return { success: true, data: result, message: "Profile updated successfully" }
  },

  delete_profile: async (supabase: SupabaseType, data: { id: string }) => {
    const { data: result, error } = await supabase.from("profiles").delete().eq("id", data.id)
    if (error) throw error
    return { success: true, data: result, message: "Profile deleted successfully" }
  },

  get_profiles: async (supabase: SupabaseType) => {
    const { data: result, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })
    if (error) throw error
    return { success: true, data: result, message: `Found ${result.length} profiles` }
  },

  get_profile_by_id: async (supabase: SupabaseType, data: { id: string }) => {
    const { data: result, error } = await supabase.from("profiles").select("*").eq("id", data.id).single()
    if (error) throw error
    return { success: true, data: result, message: "Profile retrieved successfully" }
  },

  create_task: async (supabase: SupabaseType, data: TaskData) => {
    const { data: result, error } = await supabase.from("tasks").insert(data).select()
    if (error) throw error
    return { success: true, data: result, message: "Task created successfully" }
  },

  update_task: async (supabase: SupabaseType, data: TaskData & { id: string }) => {
    const { id, ...updateData } = data
    const { data: result, error } = await supabase.from("tasks").update(updateData).eq("id", id).select()
    if (error) throw error
    return { success: true, data: result, message: "Task updated successfully" }
  },

  delete_task: async (supabase: SupabaseType, data: { id: string }) => {
    const { data: result, error } = await supabase.from("tasks").delete().eq("id", data.id)
    if (error) throw error
    return { success: true, data: result, message: "Task deleted successfully" }
  },

  get_tasks: async (supabase: SupabaseType) => {
    const { data: result, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false })
    if (error) throw error
    return { success: true, data: result, message: `Found ${result.length} tasks` }
  },

  get_task_by_id: async (supabase: SupabaseType, data: { id: string }) => {
    const { data: result, error } = await supabase.from("tasks").select("*").eq("id", data.id).single()
    if (error) throw error
    return { success: true, data: result, message: "Task retrieved successfully" }
  },

  smart_schedule: async (supabase: SupabaseType) => {
    const { data: users, error: usersError } = await supabase.from("profiles").select("id, first_name, last_name")
    if (usersError) throw usersError
    if (!users || users.length === 0) return { success: false, message: "No users found" }

    const { data: tasks, error: tasksError } = await supabase.from("tasks").select("*").is("assigned_to", null)
    if (tasksError) throw tasksError
    if (!tasks || tasks.length === 0) return { success: true, message: "No unassigned tasks" }

    const { data: allTasks, error: allTasksError } = await supabase.from("tasks").select("id, assigned_to")
    if (allTasksError) throw allTasksError

    const workload: Record<string, number> = {}
    users.forEach(u => { workload[u.id] = 0 })
    allTasks.forEach(t => { if (t.assigned_to && workload[t.assigned_to] !== undefined) workload[t.assigned_to]++ })

    const updates = []
    for (const task of tasks) {
      let minUser = users[0]
      for (const user of users) {
        if (workload[user.id] < workload[minUser.id]) minUser = user
      }
      updates.push(supabase.from("tasks").update({ assigned_to: minUser.id }).eq("id", task.id))
      workload[minUser.id]++
    }
    await Promise.all(updates)
    return { success: true, message: `Assigned ${tasks.length} tasks using smart schedule` }
  },
}

// ─── MINT database scripts ────────────────────────────────────────────────────

const mintScripts = {
  /**
   * List all tables visible to the MINT anon key.
   * Uses Supabase's information_schema via RPC if available,
   * otherwise returns a helpful message.
   */
  list_tables: async (supabase: SupabaseType) => {
    const { data, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .order("table_name")

    if (error) {
      return {
        success: false,
        message: "Could not list tables automatically. Please provide the table name manually.",
        error: error.message
      }
    }
    return { success: true, data, message: `Found ${data?.length ?? 0} tables` }
  },

  /**
   * Fetch all rows from a given MINT table.
   * data: { table: string, limit?: number }
   */
  get_records: async (supabase: SupabaseType, data: { table: string; limit?: number }) => {
    if (!data.table) throw new Error("table is required")
    const query = supabase.from(data.table).select("*").order("created_at", { ascending: false })
    if (data.limit) query.limit(data.limit)
    const { data: result, error } = await query
    if (error) throw error
    return { success: true, data: result, message: `Found ${result?.length ?? 0} records in ${data.table}` }
  },

  /**
   * Insert a record into a MINT table.
   * data: { table: string, record: object }
   */
  create_record: async (supabase: SupabaseType, data: { table: string; record: Record<string, unknown> }) => {
    if (!data.table || !data.record) throw new Error("table and record are required")
    const { data: result, error } = await supabase.from(data.table).insert(data.record).select()
    if (error) throw error
    return { success: true, data: result, message: `Record created in ${data.table}` }
  },

  /**
   * Update a record in a MINT table by ID.
   * data: { table: string, id: string | number, updates: object }
   */
  update_record: async (supabase: SupabaseType, data: { table: string; id: string; updates: Record<string, unknown> }) => {
    if (!data.table || !data.id || !data.updates) throw new Error("table, id, and updates are required")
    const { data: result, error } = await supabase.from(data.table).update(data.updates).eq("id", data.id).select()
    if (error) throw error
    return { success: true, data: result, message: `Record ${data.id} updated in ${data.table}` }
  },

  /**
   * Delete a record by ID from a MINT table.
   * data: { table: string, id: string | number }
   */
  delete_record: async (supabase: SupabaseType, data: { table: string; id: string }) => {
    if (!data.table || !data.id) throw new Error("table and id are required")
    const { error } = await supabase.from(data.table).delete().eq("id", data.id)
    if (error) throw error
    return { success: true, message: `Record ${data.id} deleted from ${data.table}` }
  },

  /**
   * Remove test/dummy records from a MINT table.
   *
   * Matches rows where a specified field contains a test pattern.
   * data: {
   *   table: string,          — table to clean
   *   field: string,          — column to match against (e.g. "email", "name")
   *   pattern: string,        — substring to match (e.g. "test", "dummy", "example")
   *   mode?: "contains" | "equals" | "starts_with"   default: "contains"
   *   dry_run?: boolean       — if true, returns what WOULD be deleted without deleting
   * }
   */
  remove_test_cases: async (
    supabase: SupabaseType,
    data: { table: string; field: string; pattern: string; mode?: string; dry_run?: boolean }
  ) => {
    if (!data.table || !data.field || !data.pattern) {
      throw new Error("table, field, and pattern are required")
    }

    const mode = data.mode ?? "contains"
    const dryRun = data.dry_run ?? false

    // Build the filter value
    let filterValue: string
    if (mode === "starts_with") filterValue = `${data.pattern}%`
    else if (mode === "equals") filterValue = data.pattern
    else filterValue = `%${data.pattern}%` // contains (default)

    const likeOperator = mode === "equals" ? "eq" : "ilike"

    // First: fetch matching records so we can report what was/would be deleted
    const { data: matches, error: fetchError } = await (
      likeOperator === "eq"
        ? supabase.from(data.table).select("*").eq(data.field, filterValue)
        : supabase.from(data.table).select("*").ilike(data.field, filterValue)
    )
    if (fetchError) throw fetchError

    if (!matches || matches.length === 0) {
      return { success: true, data: [], message: `No matching test records found in ${data.table}` }
    }

    if (dryRun) {
      return {
        success: true,
        dry_run: true,
        data: matches,
        message: `DRY RUN: Would delete ${matches.length} record(s) from ${data.table} where ${data.field} ${mode} "${data.pattern}"`
      }
    }

    // Perform the delete
    const { error: deleteError } = await (
      likeOperator === "eq"
        ? supabase.from(data.table).delete().eq(data.field, filterValue)
        : supabase.from(data.table).delete().ilike(data.field, filterValue)
    )
    if (deleteError) throw deleteError

    return {
      success: true,
      deleted_count: matches.length,
      deleted_records: matches,
      message: `Deleted ${matches.length} test record(s) from ${data.table} where ${data.field} ${mode} "${data.pattern}"`
    }
  },
}

// ─── Route handlers ───────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { script, data = {}, db = "devhub" } = body

    if (db === "mint") {
      if (!script || !mintScripts[script as keyof typeof mintScripts]) {
        return NextResponse.json({
          error: "Invalid MINT script",
          available_scripts: Object.keys(mintScripts),
        }, { status: 400 })
      }
      const mintSupabase = createMintClient()
      const result = await mintScripts[script as keyof typeof mintScripts](mintSupabase, data)
      return NextResponse.json(result)
    }

    // Default: DevHub database
    if (!script || !devhubScripts[script as keyof typeof devhubScripts]) {
      return NextResponse.json({
        error: "Invalid script",
        available_scripts: Object.keys(devhubScripts),
      }, { status: 400 })
    }
    const supabase = await createClient()
    const result = await devhubScripts[script as keyof typeof devhubScripts](supabase, data)
    return NextResponse.json(result)

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: message, success: false }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "MINT + DevHub Script Runner API",
    databases: {
      devhub: {
        description: "DevHub internal database (profiles, tasks)",
        scripts: {
          profiles: ["create_profile", "update_profile", "delete_profile", "get_profiles", "get_profile_by_id"],
          tasks: ["create_task", "update_task", "delete_task", "get_tasks", "get_task_by_id"],
          smart: ["smart_schedule"],
        }
      },
      mint: {
        description: "External MINT Supabase database",
        scripts: Object.keys(mintScripts),
      }
    },
    usage: {
      devhub_example: {
        db: "devhub",
        script: "get_profiles",
      },
      mint_example: {
        db: "mint",
        script: "remove_test_cases",
        data: {
          table: "users",
          field: "email",
          pattern: "test",
          mode: "contains",
          dry_run: true,
        }
      }
    }
  })
}
