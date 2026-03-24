import nodemailer from 'nodemailer'
import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GOOGLE_EMAIL,
    pass: process.env.GOOGLE_PASSWORD,
  },
})

const victorySlogans = [
  "Mission AccomplISHED.",
  "Dodge this.",
  "I know Kung Fu.",
  "The oracle was right.",
  "Victory is the only option.",
  "System Stabilized.",
  "Directive Executed.",
  "He's beginning to believe.",
  "Everything that has a beginning has an end.",
  "You're the one.",
  "Access Granted. Mission Success.",
  "The matrix belongs to you now."
]

export async function POST(request: Request) {
  try {
    const { taskId } = await request.json()

    if (!taskId) {
      return NextResponse.json({ error: 'Missing taskId' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 1. Fetch task details + assignee profile in one go
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select(`
        title, 
        assigned_to,
        profiles!tasks_assigned_to_fkey (
          email,
          first_name,
          last_name
        )
      `)
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      console.error('Error fetching task:', taskError)
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const assignee = task.profiles as unknown as { email: string; first_name: string; last_name: string }
    if (!assignee) {
      return NextResponse.json({ error: 'No assignee found for this task' }, { status: 400 })
    }

    // 2. Fetch admin profiles (CEO, CTO, Senior Dev)
    const { data: admins, error: adminsError } = await supabase
      .from('profiles')
      .select('email, first_name, last_name, role')
      .in('role', ['admin_assigner', 'senior'])

    if (adminsError) {
      console.error('Error fetching admins:', adminsError)
    }

    const adminEmails = admins?.map(admin => admin.email) || []
    const slogan = victorySlogans[Math.floor(Math.random() * victorySlogans.length)]
    
    // 3. Construct email content (Emerald/Cyan Success Theme)
    const taskLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tasks?q=${taskId}`
    
    const emailHtml = `
      <div style="background-color: #020617; color: #f8fafc; font-family: 'Courier New', Courier, monospace; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #10b981; border-radius: 4px; box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #10b981; text-transform: uppercase; letter-spacing: 4px; margin: 0; font-size: 24px;">Mission Success</h1>
          <p style="color: #10b981; opacity: 0.6; font-size: 10px; text-transform: uppercase; margin-top: 5px;">DevHub Secure Infrastructure // v2.0</p>
        </div>

        <div style="border-left: 2px solid #10b981; padding-left: 20px; margin-bottom: 30px;">
          <ul style="list-style: none; padding: 0; margin: 0; color: #94a3b8; font-size: 11px;">
            <li>STAtuS: COMPLETED</li>
            <li>OPERATOR: ${assignee.first_name} ${assignee.last_name}</li>
            <li>TIMESTAMP: ${new Date().toISOString()}</li>
          </ul>
          <p style="margin-top: 15px; font-style: italic; color: #f8fafc; font-size: 14px;">"${slogan}"</p>
        </div>
        
        <div style="background: rgba(16, 185, 129, 0.05); padding: 25px; border: 1px solid rgba(16, 185, 129, 0.1); border-radius: 4px; margin: 20px 0;">
          <h3 style="color: #10b981; margin-top: 0; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">Objective Secured</h3>
          <p style="font-size: 18px; font-weight: bold; margin: 10px 0;">${task.title}</p>
          <p style="color: #94a3b8; line-height: 1.6; font-size: 11px; font-weight: bold; text-transform: uppercase;">The following protocol has been successfully implemented and verified.</p>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${taskLink}" style="display: inline-block; background: #10b981; color: #020617; padding: 12px 30px; border-radius: 2px; text-decoration: none; font-weight: 900; text-transform: uppercase; font-size: 12px; letter-spacing: 2px; box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);">Review Logs</a>
        </div>
        
        <div style="border-top: 1px solid rgba(16, 185, 129, 0.1); padding-top: 20px; font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 1px;">
          <p>COMMAND CHAIN CC: ${adminEmails.length > 0 ? adminEmails.join(', ') : 'NONE'}</p>
          <p style="margin-top: 10px;">Security Protocol: ALGO-HIVE-INTERNAL // BYPASS: 0</p>
        </div>
      </div>
    `

    // 4. Send email via Google SMTP
    await transporter.sendMail({
      from: `"DevHub Terminal" <${process.env.GOOGLE_EMAIL}>`,
      to: assignee.email,
      cc: adminEmails,
      subject: `[SUCCESS] Mission Accomplished: ${task.title}`,
      html: emailHtml,
    })

    return NextResponse.json({ success: true, message: 'Success directives transmitted via Google SMTP' })
  } catch (error: any) {
    console.error('Notification error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
