const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://wsieewynjldcxzlqhqna.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzaWVld3luamxkY3h6bHFocW5hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMzOTEzMiwiZXhwIjoyMDg4OTE1MTMyfQ.NTkiNn4crXi0G3p-Bek9YOO3YxeEyryTCIeArMMh-b4";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const emails = [
  "lonwabo@mymint.co.za",
  "mihle@mymint.co.za",
  "kurt.vonschaeffer@mymint.co.za",
  "mufaro.ncube@mymint.co.za",
  "tshepo.khanyi@mymint.co.za",
  "joy.mthombeni@mymint.co.za",
];

async function updatePasswords() {
  console.log("🔑 Updating user passwords to MintDev123...\n");

  for (const email of emails) {
    try {
      const { data, error } = await supabase.auth.admin.updateUserById(
        // First, get the user by email
        (
          await supabase.auth.admin.listUsers({
            filters: `email = "${email}"`,
          })
        ).data.users[0].id,
        {
          password: "MintDev123",
        }
      );

      if (error) {
        console.log(`❌ ${email}: ${error.message}`);
      } else {
        console.log(`✅ ${email}: Password updated to MintDev123`);
      }
    } catch (error) {
      // Try alternative approach - list users first
      try {
        const listResponse = await supabase.auth.admin.listUsers();
        const user = listResponse.data.users.find((u) => u.email === email);

        if (!user) {
          console.log(`❌ ${email}: User not found`);
          continue;
        }

        const { error: updateError } = await supabase.auth.admin.updateUserById(
          user.id,
          { password: "MintDev123" }
        );

        if (updateError) {
          console.log(`❌ ${email}: ${updateError.message}`);
        } else {
          console.log(`✅ ${email}: Password updated to MintDev123`);
        }
      } catch (innerError) {
        console.log(`❌ ${email}: ${innerError.message}`);
      }
    }
  }

  console.log("\n✨ Password update complete!");
  console.log("📝 All users can now log in with password: MintDev123");
}

updatePasswords();
