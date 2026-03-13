import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

/**
 * SECURE CRUD API FOR MINT DATABASE (profiles & tasks)
 * 
 * Target Table: mihle-matimba (represented by profiles/tasks in this schema)
 * 
 * Usage:
 * POST   /api/mint - Create a new record
 * PATCH  /api/mint - Update an existing record
 * DELETE /api/mint - Remove a record
 */

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { table, data } = body

    if (!table || !["profiles", "tasks"].includes(table)) {
      return NextResponse.json({ error: "Invalid table specification" }, { status: 400 })
    }

    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { table, id, data } = body

    if (!table || !["profiles", "tasks"].includes(table) || !id) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
    }

    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq("id", id)
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const table = searchParams.get("table")
    const id = searchParams.get("id")

    if (!table || !["profiles", "tasks"].includes(table) || !id) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
