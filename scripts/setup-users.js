const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://wsieewynjldcxzlqhqna.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzaWVld3luamxkY3h6bHFocW5hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMzOTEzMiwiZXhwIjoyMDg4OTE1MTMyfQ.NTkiNn4crXi0G3p-Bek9YOO3YxeEyryTCIeArMMh-b4";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const users = [
  {
    email: "lonwabo@mymint.co.za",
    password: "MintDev123",
    first_name: "Lonwabo",
    last_name: "Damane",
    role: "admin_assigner",
    role_id: "MINT-CEO-001",
    position: "Chief Executive Officer",
  },
  {
    email: "mihle@mymint.co.za",
    password: "MintDev123",
    first_name: "Mihle",
    last_name: "Matimba",
    role: "admin_assigner",
    role_id: "MINT-CTO-002",
    position: "Chief Technology Officer",
  },
  {
    email: "kurt.vonschaeffer@mymint.co.za",
    password: "MintDev123",
    first_name: "Kurt",
    last_name: "Von Schaeffer",
    role: "admin_assigner",
    role_id: "MINT-SSD-003",
    position: "Senior Software Developer",
  },
  {
    email: "mufaro.ncube@mymint.co.za",
    password: "MintDev123",
    first_name: "Mufaro",
    last_name: "Ncube",
    role: "junior",
    role_id: "MINT-JSD-004",
    position: "Junior Software Developer",
  },
  {
    email: "tshepo.khanyi@mymint.co.za",
    password: "MintDev123",
    first_name: "Tshepo",
    last_name: "Khanyi",
    role: "junior",
    role_id: "MINT-JFD-005",
    position: "Junior Full Stack Developer",
  },
  {
    email: "joy.mthombeni@mymint.co.za",
    password: "MintDev123",
    first_name: "Joy",
    last_name: "Mthombeni",
    role: "junior",
    role_id: "MINT-ISD-006",
    position: "Intern Software Developer",
  },
];

async function setupUsers() {
  console.log("🚀 Starting user setup...\n");

  for (const user of users) {
    try {
      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      });

      if (authError) {
        console.log(`❌ ${user.email}: ${authError.message}`);
        continue;
      }

      const userId = authData.user.id;

      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        role_id: user.role_id,
        position: user.position,
        access: true,
      });

      if (profileError) {
        console.log(`❌ ${user.email} profile: ${profileError.message}`);
      } else {
        console.log(
          `✅ ${user.email} (${user.role}) - Password: MintDev123`
        );
      }
    } catch (error) {
      console.log(`❌ ${user.email}: ${error.message}`);
    }
  }

  console.log("\n✨ Setup complete! All users can now log in with password: MintDev123");
}

setupUsers();
