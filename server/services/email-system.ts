// Email notification system for StudentOS
// Handles scholarship deadlines, welcome sequences, and progress updates

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: Record<string, string>;
}

export interface EmailNotification {
  to: string;
  template: string;
  variables: Record<string, any>;
  scheduledFor?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// Email templates for StudentOS
export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  welcome_student: {
    subject: "Welcome to StudentOS - Your AI-Powered College Journey Begins!",
    htmlContent: `
      <h2>Welcome {{firstName}}!</h2>
      <p>You've just joined thousands of students using AI to unlock scholarship opportunities and improve their college applications.</p>
      
      <h3>Get Started in 3 Steps:</h3>
      <ol>
        <li><strong>Complete Your Profile</strong> - Help us find scholarships that match YOU</li>
        <li><strong>Upload Writing Samples</strong> - Create your Voice DNA for authentic essay assistance</li>
        <li><strong>Discover Scholarships</strong> - Find hidden opportunities others miss</li>
      </ol>
      
      <a href="{{dashboardUrl}}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Complete Your Profile</a>
      
      <p>Questions? Reply to this email - we're here to help!</p>
      <p>The StudentOS Team</p>
    `,
    textContent: `
      Welcome {{firstName}}!
      
      You've just joined thousands of students using AI to unlock scholarship opportunities and improve their college applications.
      
      Get Started in 3 Steps:
      1. Complete Your Profile - Help us find scholarships that match YOU
      2. Upload Writing Samples - Create your Voice DNA for authentic essay assistance  
      3. Discover Scholarships - Find hidden opportunities others miss
      
      Get started: {{dashboardUrl}}
      
      Questions? Reply to this email - we're here to help!
      The StudentOS Team
    `,
    variables: { firstName: '', dashboardUrl: '' }
  },

  scholarship_deadline_warning: {
    subject: "⏰ Scholarship Deadline in {{daysLeft}} Days - {{scholarshipTitle}}",
    htmlContent: `
      <h2>Don't Miss Out, {{firstName}}!</h2>
      <p>You have <strong>{{daysLeft}} days</strong> left to apply for:</p>
      
      <div style="border: 2px solid #F59E0B; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h3>{{scholarshipTitle}}</h3>
        <p><strong>Amount:</strong> ${{amount}}</p>
        <p><strong>Provider:</strong> {{provider}}</p>
        <p><strong>Deadline:</strong> {{deadline}}</p>
        <p><strong>Your Match Score:</strong> {{matchScore}}%</p>
      </div>
      
      <a href="{{applicationUrl}}" style="background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Apply Now</a>
      
      <p>Need help with your application essay? Use StudentOS's voice-aware essay assistance to write authentic applications that sound like you.</p>
      
      <a href="{{essayHelpUrl}}">Get Essay Help</a>
    `,
    textContent: `
      Don't Miss Out, {{firstName}}!
      
      You have {{daysLeft}} days left to apply for:
      
      {{scholarshipTitle}}
      Amount: ${{amount}}
      Provider: {{provider}}
      Deadline: {{deadline}}
      Your Match Score: {{matchScore}}%
      
      Apply: {{applicationUrl}}
      
      Need essay help? {{essayHelpUrl}}
      
      The StudentOS Team
    `,
    variables: { firstName: '', daysLeft: '', scholarshipTitle: '', amount: '', provider: '', deadline: '', matchScore: '', applicationUrl: '', essayHelpUrl: '' }
  },

  essay_analysis_complete: {
    subject: "📝 Your Essay Analysis is Ready - {{essayTitle}}",
    htmlContent: `
      <h2>Great Work, {{firstName}}!</h2>
      <p>Your essay analysis for "<strong>{{essayTitle}}</strong>" is complete.</p>
      
      <h3>Your Scores:</h3>
      <ul>
        <li><strong>Clarity:</strong> {{clarityScore}}/10</li>
        <li><strong>Impact:</strong> {{impactScore}}/10</li>
        <li><strong>Originality:</strong> {{originalityScore}}/10</li>
        <li><strong>Voice Authenticity:</strong> {{voiceScore}}/10</li>
      </ul>
      
      <p>We found <strong>{{suggestionCount}} voice-preserved suggestions</strong> to make your essay even stronger while keeping it authentically yours.</p>
      
      <a href="{{essayUrl}}" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Suggestions</a>
      
      <p>Remember: These suggestions preserve your natural writing voice. Your essay will sound like YOU, just improved.</p>
    `,
    textContent: `
      Great Work, {{firstName}}!
      
      Your essay analysis for "{{essayTitle}}" is complete.
      
      Your Scores:
      - Clarity: {{clarityScore}}/10
      - Impact: {{impactScore}}/10  
      - Originality: {{originalityScore}}/10
      - Voice Authenticity: {{voiceScore}}/10
      
      We found {{suggestionCount}} voice-preserved suggestions to make your essay stronger while keeping it authentically yours.
      
      View suggestions: {{essayUrl}}
      
      The StudentOS Team
    `,
    variables: { firstName: '', essayTitle: '', clarityScore: '', impactScore: '', originalityScore: '', voiceScore: '', suggestionCount: '', essayUrl: '' }
  },

  parent_weekly_report: {
    subject: "📊 {{firstName}}'s Weekly Progress Report - StudentOS",
    htmlContent: `
      <h2>{{firstName}}'s Progress This Week</h2>
      
      <h3>🎯 Scholarship Applications</h3>
      <ul>
        <li>{{scholarshipsFound}} new scholarships matched</li>
        <li>{{applicationsStarted}} applications in progress</li>
        <li>{{deadlinesUpcoming}} upcoming deadlines</li>
      </ul>
      
      <h3>✍️ Essay Development</h3>
      <ul>
        <li>{{essaysAnalyzed}} essays analyzed</li>
        <li>{{avgImprovementScore}}% average improvement in scores</li>
        <li>{{voiceAuthenticityScore}}% voice authenticity maintained</li>
      </ul>
      
      <h3>🤖 AI Assistance Transparency</h3>
      <p>All AI assistance preserves {{firstName}}'s authentic voice and writing style. Essays sound like your student wrote them personally.</p>
      <ul>
        <li>{{aiInteractions}} AI interactions this week</li>
        <li>{{originalityMaintained}}% originality maintained</li>
        <li>All assistance logged for academic integrity</li>
      </ul>
      
      <a href="{{parentDashboardUrl}}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Full Report</a>
    `,
    textContent: `
      {{firstName}}'s Progress This Week
      
      Scholarship Applications:
      - {{scholarshipsFound}} new scholarships matched
      - {{applicationsStarted}} applications in progress  
      - {{deadlinesUpcoming}} upcoming deadlines
      
      Essay Development:
      - {{essaysAnalyzed}} essays analyzed
      - {{avgImprovementScore}}% average improvement
      - {{voiceAuthenticityScore}}% voice authenticity maintained
      
      AI Assistance Transparency:
      All AI assistance preserves {{firstName}}'s authentic voice. Essays sound like your student wrote them personally.
      - {{aiInteractions}} AI interactions this week
      - {{originalityMaintained}}% originality maintained
      - All assistance logged for academic integrity
      
      View full report: {{parentDashboardUrl}}
      
      The StudentOS Team
    `,
    variables: { firstName: '', scholarshipsFound: '', applicationsStarted: '', deadlinesUpcoming: '', essaysAnalyzed: '', avgImprovementScore: '', voiceAuthenticityScore: '', aiInteractions: '', originalityMaintained: '', parentDashboardUrl: '' }
  },

  new_scholarship_matches: {
    subject: "🎉 {{matchCount}} New Scholarship Matches Found for {{firstName}}",
    htmlContent: `
      <h2>New Opportunities Discovered!</h2>
      <p>Hi {{firstName}}, we found {{matchCount}} new scholarships that match your profile:</p>
      
      {{#scholarships}}
      <div style="border: 1px solid #E5E7EB; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h3>{{title}}</h3>
        <p><strong>Amount:</strong> ${{amount}} | <strong>Match:</strong> {{matchScore}}% | <strong>Competition:</strong> {{competitiveness}}</p>
        <p><strong>Deadline:</strong> {{deadline}}</p>
        <p>{{reason}}</p>
      </div>
      {{/scholarships}}
      
      <a href="{{scholarshipsUrl}}" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View All Matches</a>
      
      <p><strong>Pro Tip:</strong> Local scholarships often have better odds. We've prioritized these in your matches.</p>
    `,
    textContent: `
      New Opportunities Discovered!
      
      Hi {{firstName}}, we found {{matchCount}} new scholarships that match your profile:
      
      {{#scholarships}}
      {{title}}
      Amount: ${{amount}} | Match: {{matchScore}}% | Competition: {{competitiveness}}
      Deadline: {{deadline}}
      {{reason}}
      
      {{/scholarships}}
      
      View all matches: {{scholarshipsUrl}}
      
      Pro Tip: Local scholarships often have better odds. We've prioritized these in your matches.
      
      The StudentOS Team
    `,
    variables: { firstName: '', matchCount: '', scholarships: [], scholarshipsUrl: '' }
  }
};

export class EmailService {
  private apiKey: string;
  private fromEmail: string;
  
  constructor() {
    this.apiKey = process.env.EMAIL_API_KEY || '';
    this.fromEmail = process.env.FROM_EMAIL || 'StudentOS <hello@studentos.com>';
  }

  async sendEmail(notification: EmailNotification): Promise<boolean> {
    if (!this.apiKey) {
      console.log('Email API not configured - would send:', notification);
      return false;
    }

    try {
      // Implementation would use service like SendGrid, Mailgun, or AWS SES
      // For now, log the email that would be sent
      
      const template = EMAIL_TEMPLATES[notification.template];
      if (!template) {
        console.error(`Email template ${notification.template} not found`);
        return false;
      }

      const subject = this.replaceVariables(template.subject, notification.variables);
      const htmlContent = this.replaceVariables(template.htmlContent, notification.variables);
      
      console.log(`📧 EMAIL SEND (${notification.priority}):`, {
        to: notification.to,
        subject,
        template: notification.template,
        scheduledFor: notification.scheduledFor
      });

      // Here you would integrate with your email service:
      // await emailProvider.send({ to, subject, htmlContent, textContent });
      
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  private replaceVariables(content: string, variables: Record<string, any>): string {
    let result = content;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    }
    return result;
  }

  async scheduleScholarshipReminders(userId: string, scholarshipMatches: any[]): Promise<void> {
    for (const match of scholarshipMatches) {
      const deadline = new Date(match.deadline);
      const now = new Date();
      
      // Schedule reminders for 7 days, 3 days, and 1 day before deadline
      const reminderDays = [7, 3, 1];
      
      for (const days of reminderDays) {
        const reminderDate = new Date(deadline);
        reminderDate.setDate(deadline.getDate() - days);
        
        if (reminderDate > now) {
          // Schedule the reminder email
          await this.sendEmail({
            to: match.userEmail,
            template: 'scholarship_deadline_warning',
            variables: {
              firstName: match.firstName,
              daysLeft: days,
              scholarshipTitle: match.title,
              amount: match.amount.toLocaleString(),
              provider: match.provider,
              deadline: deadline.toLocaleDateString(),
              matchScore: match.matchScore,
              applicationUrl: match.applicationUrl,
              essayHelpUrl: `${process.env.BASE_URL}/essays/new`
            },
            scheduledFor: reminderDate,
            priority: days === 1 ? 'urgent' : 'high'
          });
        }
      }
    }
  }

  async sendWelcomeSequence(userEmail: string, firstName: string): Promise<void> {
    await this.sendEmail({
      to: userEmail,
      template: 'welcome_student',
      variables: {
        firstName,
        dashboardUrl: `${process.env.BASE_URL}/dashboard`
      },
      priority: 'medium'
    });
  }

  async sendEssayAnalysisComplete(userEmail: string, essayData: any): Promise<void> {
    await this.sendEmail({
      to: userEmail,
      template: 'essay_analysis_complete',
      variables: {
        firstName: essayData.firstName,
        essayTitle: essayData.title,
        clarityScore: essayData.clarityScore,
        impactScore: essayData.impactScore,
        originalityScore: essayData.originalityScore,
        voiceScore: essayData.voiceScore || 8,
        suggestionCount: essayData.suggestionCount,
        essayUrl: `${process.env.BASE_URL}/essays/${essayData.id}`
      },
      priority: 'low'
    });
  }
}

export const emailService = new EmailService();