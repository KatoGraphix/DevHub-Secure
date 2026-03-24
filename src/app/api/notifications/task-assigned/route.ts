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

const slogans = [
  "Welcome to the real world.",
  "There is no spoon.",
  "Your mission, should you choose to accept it...",
  "This is the way.",
  "Free your mind.",
  "He's beginning to believe.",
  "Red pill or blue pill?",
  "Everything that has a beginning has an end.",
  "I'm gonna make him an offer he can't refuse.",
  "May the Force be with you.",
  "Bond. James Bond.",
  "I'll be back.",
  "The chosen one has arrived.",
  "Follow the white rabbit."
]

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
    // We assume 'admin_assigner' covers CEO/CTO and 'senior' covers Senior Dev
    const { data: admins, error: adminsError } = await supabase
      .from('profiles')
      .select('email, first_name, last_name, role')
      .in('role', ['admin_assigner', 'senior'])

    if (adminsError) {
      console.error('Error fetching admins:', adminsError)
    }

    const adminEmails = admins?.map(admin => admin.email) || []
    const slogan = slogans[Math.floor(Math.random() * slogans.length)]
    
    // 4. Construct email content (Cyberpunk v2.0 Theme)
    const taskLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tasks?q=${taskId}`
    
    const emailHtml = `
      <div style="background-color: #020617; color: #f8fafc; font-family: 'Courier New', Courier, monospace; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #06b6d4; border-radius: 4px; box-shadow: 0 0 20px rgba(6, 182, 212, 0.2);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #06b6d4; text-transform: uppercase; letter-spacing: 4px; margin: 0; font-size: 24px;">New Directive</h1>
          <p style="color: #06b6d4; opacity: 0.6; font-size: 10px; text-transform: uppercase; margin-top: 5px;">DevHub Secure Infrastructure // v2.0</p>
        </div>

        <div style="border-left: 2px solid #06b6d4; padding-left: 20px; margin-bottom: 30px;">
          <p style="margin: 0; font-weight: bold; color: #06b6d4;">Operator ${assignee.first_name},</p>
          <p style="margin-top: 10px; font-style: italic; color: #f8fafc;">"${slogan}"</p>
        </div>
        
        <div style="background: rgba(6, 182, 212, 0.05); padding: 25px; border: 1px solid rgba(6, 182, 212, 0.1); border-radius: 4px; margin: 20px 0;">
          <h3 style="color: #06b6d4; margin-top: 0; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">Mission Brief</h3>
          <p style="font-size: 18px; font-weight: bold; margin: 10px 0;">${task.title}</p>
          <p style="color: #94a3b8; line-height: 1.6; font-size: 13px;">${task.description || 'No additional mission details provided.'}</p>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${taskLink}" style="display: inline-block; background: #06b6d4; color: #020617; padding: 12px 30px; border-radius: 2px; text-decoration: none; font-weight: 900; text-transform: uppercase; font-size: 12px; letter-spacing: 2px; box-shadow: 0 0 15px rgba(6, 182, 212, 0.4);">Access Terminal</a>
        </div>
        
        <div style="border-top: 1px solid rgba(6, 182, 212, 0.1); padding-top: 20px; font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 1px;">
          <p>COMMAND CHAIN CC: ${adminEmails.length > 0 ? adminEmails.join(', ') : 'NONE'}</p>
          <p style="margin-top: 10px;">Security Protocol: ALGO-HIVE-INTERNAL</p>
        </div>
      </div>
    `

    // 5. Send email via Google SMTP
    await transporter.sendMail({
      from: `"DevHub Terminal" <${process.env.GOOGLE_EMAIL}>`,
      to: assignee.email,
      cc: adminEmails,
      subject: `[DIRECTIVE-L1] New Assignment: ${task.title}`,
      html: emailHtml,
    })

    return NextResponse.json({ success: true, message: 'Directives transmitted via Google SMTP' })
  } catch (error: any) {
    console.error('Notification error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
