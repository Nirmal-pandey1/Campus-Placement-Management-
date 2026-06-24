const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; }
    .wrapper { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 32px; text-align: center; }
    .header h1 { color: white; font-size: 24px; font-weight: 700; }
    .header p { color: #bfdbfe; font-size: 13px; margin-top: 4px; }
    .body { padding: 32px; }
    .body h2 { font-size: 20px; color: #1e293b; margin-bottom: 12px; }
    .body p { font-size: 15px; color: #475569; line-height: 1.7; margin-bottom: 12px; }
    .info-box { background: #f8fafc; border-left: 4px solid #2563eb; border-radius: 8px; padding: 16px; margin: 20px 0; }
    .info-box p { margin: 4px 0; font-size: 14px; color: #334155; }
    .info-box strong { color: #1e293b; }
    .badge { display: inline-block; padding: 6px 16px; border-radius: 999px; font-size: 13px; font-weight: 600; margin: 8px 0; }
    .badge.green  { background: #dcfce7; color: #16a34a; }
    .badge.blue   { background: #dbeafe; color: #2563eb; }
    .badge.red    { background: #fee2e2; color: #dc2626; }
    .badge.yellow { background: #fef9c3; color: #ca8a04; }
    .badge.purple { background: #f3e8ff; color: #9333ea; }
    .btn { display: inline-block; background: #2563eb; color: white !important; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 16px 0; }
    .footer { background: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { font-size: 12px; color: #94a3b8; }
    .footer strong { color: #64748b; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🎓 CareerSync</h1>
      <p>A Digital Platform For Campus Recruitment</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} <strong>CareerSync</strong> — A Digital Platform For Campus Recruitment</p>
      <p style="margin-top:4px">This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

// ── Student applied for a job ──────────────────────────────────────
exports.applicationSubmitted = ({ studentName, jobTitle, companyName, deadline }) =>
  baseTemplate(`
    <h2>Application Submitted! 🎉</h2>
    <p>Hi <strong>${studentName}</strong>,</p>
    <p>Your application has been successfully submitted. Here are the details:</p>
    <div class="info-box">
      <p><strong>Job Title:</strong> ${jobTitle}</p>
      <p><strong>Company:</strong> ${companyName}</p>
      <p><strong>Applied On:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Drive Deadline:</strong> ${new Date(deadline).toLocaleDateString()}</p>
    </div>
    <p>We will notify you when the company updates your application status. Best of luck! 🚀</p>
    <a href="${process.env.CLIENT_URL}/applications" class="btn">View My Applications</a>
  `);

// ── Application status updated ─────────────────────────────────────
exports.applicationStatusUpdated = ({ studentName, jobTitle, companyName, status, feedback, offeredCTC }) => {
  const badgeMap = {
    shortlisted: { cls: "blue",   emoji: "📋", msg: "You have been shortlisted!" },
    interview:   { cls: "purple", emoji: "🗓", msg: "You have been called for an interview!" },
    selected:    { cls: "green",  emoji: "🎉", msg: "Congratulations! You have been selected!" },
    rejected:    { cls: "red",    emoji: "😔", msg: "Unfortunately, your application was not selected." },
  };
  const info = badgeMap[status] || { cls: "blue", emoji: "📌", msg: "Your application status has been updated." };

  return baseTemplate(`
    <h2>${info.emoji} Application Update</h2>
    <p>Hi <strong>${studentName}</strong>,</p>
    <p>${info.msg}</p>
    <div class="info-box">
      <p><strong>Job Title:</strong> ${jobTitle}</p>
      <p><strong>Company:</strong> ${companyName}</p>
      <p><strong>Status:</strong> <span class="badge ${info.cls}">${status.toUpperCase()}</span></p>
      ${offeredCTC ? `<p><strong>Offered CTC:</strong> ₹${offeredCTC} LPA 🎊</p>` : ""}
      ${feedback   ? `<p><strong>Feedback:</strong> ${feedback}</p>`               : ""}
    </div>
    ${status === "selected"
      ? `<p>Welcome to your new journey! Please check your email for further onboarding details from ${companyName}.</p>`
      : status === "interview"
      ? `<p>Please be well prepared for the interview. All the best! 💪</p>`
      : ""}
    <a href="${process.env.CLIENT_URL}/applications" class="btn">View Application</a>
  `);
};

// ── Company approved/rejected by admin ────────────────────────────
exports.companyApprovalStatus = ({ companyName, hrName, isApproved }) =>
  baseTemplate(`
    <h2>${isApproved ? "🎉 Company Approved!" : "❌ Company Registration Rejected"}</h2>
    <p>Hi <strong>${hrName}</strong>,</p>
    ${isApproved
      ? `<p>Your company <strong>${companyName}</strong> has been approved on CareerSync! You can now post jobs and recruit campus talent.</p>`
      : `<p>Unfortunately, your company <strong>${companyName}</strong> registration has been rejected by the admin. Please contact the placement office for more details.</p>`
    }
    <div class="info-box">
      <p><strong>Company:</strong> ${companyName}</p>
      <p><strong>Status:</strong>
        <span class="badge ${isApproved ? "green" : "red"}">
          ${isApproved ? "APPROVED" : "REJECTED"}
        </span>
      </p>
    </div>
    ${isApproved ? `<a href="${process.env.CLIENT_URL}/company" class="btn">Go to Dashboard</a>` : ""}
  `);

// ── Job approved/rejected by admin ────────────────────────────────
exports.jobApprovalStatus = ({ hrName, jobTitle, companyName, isApproved }) =>
  baseTemplate(`
    <h2>${isApproved ? "✅ Job Approved!" : "❌ Job Rejected"}</h2>
    <p>Hi <strong>${hrName}</strong>,</p>
    ${isApproved
      ? `<p>Your job posting <strong>${jobTitle}</strong> has been approved and is now live for students to apply!</p>`
      : `<p>Your job posting <strong>${jobTitle}</strong> has been rejected by the admin. Please contact the placement office.</p>`
    }
    <div class="info-box">
      <p><strong>Job Title:</strong> ${jobTitle}</p>
      <p><strong>Company:</strong> ${companyName}</p>
      <p><strong>Status:</strong>
        <span class="badge ${isApproved ? "green" : "red"}">
          ${isApproved ? "APPROVED" : "REJECTED"}
        </span>
      </p>
    </div>
    ${isApproved ? `<a href="${process.env.CLIENT_URL}/company/jobs" class="btn">View Job</a>` : ""}
  `);

// ── New job posted — notify students ──────────────────────────────
exports.newJobAlert = ({ studentName, jobTitle, companyName, salary, deadline, branches }) =>
  baseTemplate(`
    <h2>🆕 New Job Opportunity!</h2>
    <p>Hi <strong>${studentName}</strong>,</p>
    <p>A new job matching your profile has been posted on CareerSync!</p>
    <div class="info-box">
      <p><strong>Job Title:</strong> ${jobTitle}</p>
      <p><strong>Company:</strong> ${companyName}</p>
      <p><strong>Salary:</strong> ₹${salary} LPA</p>
      <p><strong>Eligible Branches:</strong> ${branches?.join(", ") || "All Branches"}</p>
      <p><strong>Last Date to Apply:</strong> ${new Date(deadline).toLocaleDateString()}</p>
    </div>
    <p>Don't miss this opportunity. Apply before the deadline!</p>
    <a href="${process.env.CLIENT_URL}/jobs" class="btn">View & Apply Now</a>
  `);