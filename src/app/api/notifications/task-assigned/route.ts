import { Resend } from 'resend'
import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { taskId, assigneeId } = await request.json()

    if (!taskId || !assigneeId) {
      return NextResponse.json({ error: 'Missing taskId or assigneeId' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 1. Fetch task details
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('title, description')
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      console.error('Error fetching task:', taskError)
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // 2. Fetch assignee profile
    const { data: assignee, error: assigneeError } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('id', assigneeId)
      .single()

    if (assigneeError || !assignee) {
      console.error('Error fetching assignee:', assigneeError)
      return NextResponse.json({ error: 'Assignee not found' }, { status: 404 })
    }

    // 3. Fetch admin profiles (CEO, CTO, Senior Dev)
    const { data: admins, error: adminsError } = await supabase
      .from('profiles')
      .select('email, first_name, last_name, role')
      .in('role', ['admin_assigner', 'senior'])

    if (adminsError) {
      console.error('Error fetching admins:', adminsError)
    }

    const adminEmails = admins?.map(admin => admin.email) || []
    
    // 4. Construct email content
    const taskLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5001'}/dashboard/tasks?q=${taskId}`
    
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #3b82f6;">New Task Assigned</h2>
        <p>Hi ${assignee.first_name},</p>
        <p>A new task has been assigned to you in <strong>DevHub Secure</strong>.</p>
        
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${task.title}</h3>
          <p style="color: #4b5563;">${task.description || 'No description provided.'}</p>
        </div>
        
        <a href="${taskLink}" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">View Task</a>
        
        <p style="margin-top: 30px; font-size: 12px; color: #9ca3af;">
          CC: ${adminEmails.join(', ')}
        </p>
      </div>
    `

    // 5. Send email
    const { data, error } = await resend.emails.send({
      from: 'DevHub Notifications <notifications@resend.dev>', // Keep as resend.dev for testing unless domain verified
      to: assignee.email,
      cc: adminEmails,
      subject: `[DevHub] New Task Assigned: ${task.title}`,
      html: emailHtml,
    })

    if (error) {
      console.error('Error sending email:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Notification error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
