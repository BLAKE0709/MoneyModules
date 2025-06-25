// Email service for StudentOS
// In a production environment, this would integrate with services like SendGrid, Mailgun, or AWS SES

interface EmailData {
  to: string;
  template: string;
  variables: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
}

interface EmailTemplate {
  subject: string;
  content: string;
}

class EmailService {
  private templates: Record<string, EmailTemplate> = {
    welcome: {
      subject: "Welcome to StudentOS - Your AI-Powered Academic Journey Begins!",
      content: `
Hello {{firstName}},

Welcome to StudentOS! We're excited to help you excel in your academic journey with our AI-powered tools while maintaining your authentic voice.

Here's what you can do right away:
• Upload writing samples to build your Voice DNA profile
• Discover scholarships matched to your profile
• Get AI-powered essay analysis and improvement suggestions

Get started: {{platformUrl}}

Best regards,
The StudentOS Team
      `
    },
    
    scholarship_deadline: {
      subject: "🚨 Scholarship Deadline Alert: {{scholarshipTitle}}",
      content: `
Hi {{firstName}},

The deadline for "{{scholarshipTitle}}" is approaching fast!

💰 Amount: ${{amount}}
📅 Deadline: {{deadline}}
⏰ Days left: {{daysLeft}}
🎯 Match score: {{matchScore}}%

Don't miss out on this opportunity. Apply now: {{applicationUrl}}

Need help with your application? Use our AI essay coach to perfect your submissions.

Best of luck,
StudentOS Team
      `
    },
    
    essay_analysis_complete: {
      subject: "Your Essay Analysis is Ready - {{essayTitle}}",
      content: `
Hi {{firstName}},

Great news! We've completed the analysis of your essay "{{essayTitle}}".

📊 Your Scores:
• Clarity: {{clarityScore}}/10
• Impact: {{impactScore}}/10  
• Originality: {{originalityScore}}/10
• Voice Authenticity: {{voiceScore}}/10

🎯 {{suggestionCount}} improvement suggestions are waiting for you.

The best part? Our Voice DNA technology ensures all suggestions maintain your authentic writing style.

View your analysis: {{essayUrl}}

Keep up the excellent work!
StudentOS Team
      `
    },
    
    new_scholarship_matches: {
      subject: "{{matchCount}} New Scholarship Matches Found!",
      content: `
Hi {{firstName}},

We found {{matchCount}} new scholarship opportunities that match your profile perfectly!

Top matches include:
{{#scholarships}}
• {{title}} - ${{amount}} ({{matchScore}}% match)
{{/scholarships}}

View all matches: {{scholarshipsUrl}}

Remember: Early applications often have better success rates. Don't wait!

Best regards,
StudentOS Team
      `
    },
    
    weekly_progress: {
      subject: "Your Weekly Progress Report",
      content: `
Hi {{firstName}},

Here's your week in review:

📝 Essays: {{essaysAnalyzed}} analyzed with avg score of {{avgScore}}/10
🏆 Scholarships: {{newMatches}} new matches found
💡 AI Interactions: {{aiInteractions}} coaching sessions
🎯 Voice Preservation: {{voiceScore}}% authenticity maintained

Your academic integrity score remains excellent at {{integrityScore}}%.

Keep up the amazing work! Your future self will thank you.

StudentOS Team
      `
    },
    
    parent_report: {
      subject: "{{studentName}}'s Academic Progress Report",
      content: `
Dear Parent/Guardian,

Here's {{studentName}}'s progress report for this period:

🎓 Academic Integrity Score: {{integrityScore}}% (Excellent)
📚 Essays Improved: {{essaysCompleted}}
💰 Scholarship Value Found: ${{scholarshipValue}}
🤖 AI Assistance Level: Coaching & Enhancement (not replacement)

Key Highlights:
• Voice authenticity maintained at {{voiceScore}}%
• Original content percentage: {{originalityScore}}%
• Zero academic integrity concerns flagged

{{studentName}} is effectively using AI as a learning tool while maintaining academic standards and developing valuable 21st-century skills.

View detailed dashboard: {{parentDashboardUrl}}

Best regards,
StudentOS Team
      `
    }
  };

  async sendEmail(data: EmailData): Promise<void> {
    const template = this.templates[data.template];
    if (!template) {
      throw new Error(`Email template '${data.template}' not found`);
    }

    // Replace template variables
    let subject = template.subject;
    let content = template.content;
    
    Object.entries(data.variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, String(value));
      content = content.replace(regex, String(value));
    });

    // In production, this would send via email service
    console.log(`📧 Email sent to ${data.to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Priority: ${data.priority}`);
    console.log('---');
  }

  async sendWelcomeSequence(email: string, firstName: string): Promise<void> {
    const emailData = {
      to: email,
      template: 'welcome',
      variables: {
        firstName,
        platformUrl: process.env.BASE_URL || 'https://studentos.com'
      },
      priority: 'medium' as const
    };

    await this.sendEmail(emailData);
    
    // Schedule follow-up emails (in production, use a queue system)
    setTimeout(() => {
      this.sendOnboardingTips(email, firstName);
    }, 24 * 60 * 60 * 1000); // 24 hours later
  }

  async sendOnboardingTips(email: string, firstName: string): Promise<void> {
    // Follow-up onboarding email
    console.log(`📧 Sending onboarding tips to ${firstName} at ${email}`);
  }

  async scheduleScholarshipReminders(userId: string, scholarshipMatches: any[]): Promise<void> {
    for (const match of scholarshipMatches) {
      const deadline = new Date(match.deadline);
      const now = new Date();
      const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Schedule reminders at 7 days, 3 days, and 1 day before deadline
      const reminderDays = [7, 3, 1];
      
      for (const reminderDay of reminderDays) {
        if (daysUntil <= reminderDay && daysUntil > 0) {
          const emailData = {
            to: match.userEmail,
            template: 'scholarship_deadline',
            variables: {
              firstName: match.firstName,
              scholarshipTitle: match.title,
              amount: match.amount.toLocaleString(),
              deadline: deadline.toLocaleDateString(),
              daysLeft: daysUntil,
              matchScore: match.matchScore,
              applicationUrl: match.applicationUrl
            },
            priority: daysUntil <= 1 ? 'high' as const : 'medium' as const
          };
          
          await this.sendEmail(emailData);
        }
      }
    }
  }

  async sendEssayAnalysisComplete(email: string, essayData: any): Promise<void> {
    const emailData = {
      to: email,
      template: 'essay_analysis_complete',
      variables: {
        firstName: essayData.firstName,
        essayTitle: essayData.title,
        clarityScore: essayData.clarityScore,
        impactScore: essayData.impactScore,
        originalityScore: essayData.originalityScore,
        voiceScore: essayData.voiceScore,
        suggestionCount: essayData.suggestionCount,
        essayUrl: `${process.env.BASE_URL || 'https://studentos.com'}/essays/${essayData.id}`
      },
      priority: 'low' as const
    };

    await this.sendEmail(emailData);
  }

  async sendWeeklyProgressReport(email: string, firstName: string, progressData: any): Promise<void> {
    const emailData = {
      to: email,
      template: 'weekly_progress',
      variables: {
        firstName,
        essaysAnalyzed: progressData.essaysAnalyzed,
        avgScore: progressData.avgScore,
        newMatches: progressData.newMatches,
        aiInteractions: progressData.aiInteractions,
        voiceScore: progressData.voiceScore,
        integrityScore: progressData.integrityScore
      },
      priority: 'low' as const
    };

    await this.sendEmail(emailData);
  }

  async sendParentReport(parentEmail: string, studentName: string, reportData: any): Promise<void> {
    const emailData = {
      to: parentEmail,
      template: 'parent_report',
      variables: {
        studentName,
        integrityScore: reportData.integrityScore,
        essaysCompleted: reportData.essaysCompleted,
        scholarshipValue: reportData.scholarshipValue.toLocaleString(),
        voiceScore: reportData.voiceScore,
        originalityScore: reportData.originalityScore,
        parentDashboardUrl: `${process.env.BASE_URL || 'https://studentos.com'}/parent/${reportData.studentId}`
      },
      priority: 'medium' as const
    };

    await this.sendEmail(emailData);
  }
}

export const emailService = new EmailService();