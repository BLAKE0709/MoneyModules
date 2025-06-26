// TypeScript interfaces for intelligent scholarship discovery
interface StudentPersona {
  id: string;
  userId: string;
  activities?: string | null;
  interests?: string | null;
  careerGoals?: string | null;
  location?: string | null;
}

export interface IntelligentMatch {
  scholarshipId: string;
  matchType: 'hidden_gem' | 'social_network' | 'activity_based' | 'location_specific' | 'employer_based';
  matchReason: string;
  confidenceScore: number;
  discoverability: 'impossible' | 'unlikely' | 'difficult' | 'moderate';
  suggestedAction: string;
}

export interface SocialConnection {
  type: 'parent_employer' | 'coach_organization' | 'volunteer_org' | 'local_business' | 'family_connection';
  organization: string;
  connectionDetail: string;
  potentialScholarships: string[];
}

export interface HiddenOpportunity {
  id: string;
  title: string;
  provider: string;
  amount: number;
  deadline: Date;
  requirements: string[];
  discoveryTriggers: string[]; // What personal details unlock this opportunity
  localityFactors: string[]; // Geographic or community-specific factors
  socialTriggers: string[]; // Social network connections that reveal this
  activityTriggers: string[]; // Specific activities that qualify
  hiddenGemScore: number; // How unlikely students are to find this organically
}

export class IntelligentScholarshipScout {
  
  // Analyze student persona for hidden scholarship opportunities
  async discoverHiddenOpportunities(persona: StudentPersona): Promise<IntelligentMatch[]> {
    const matches: IntelligentMatch[] = [];
    
    // Activity-based discovery
    matches.push(...this.analyzeActivities(persona));
    
    // Geographic/community discovery
    matches.push(...this.analyzeLocationFactors(persona));
    
    // Social network potential (placeholder for future social integration)
    matches.push(...this.analyzeSocialPotential(persona));
    
    // Employment connection discovery
    matches.push(...this.analyzeEmploymentConnections(persona));
    
    return matches.sort((a, b) => b.confidenceScore - a.confidenceScore);
  }
  
  private analyzeActivities(persona: any): IntelligentMatch[] {
    const matches: IntelligentMatch[] = [];
    const activitiesStr = persona.activities || '';
    const activities = activitiesStr.split(',').map((a: string) => a.trim());
    
    // Soccer referee example - highly specific activity scholarship
    if (activities.some((activity: string) => 
      activity.toLowerCase().includes('referee') || 
      activity.toLowerCase().includes('soccer') ||
      activity.toLowerCase().includes('football')
    )) {
      matches.push({
        scholarshipId: 'soccer-referee-2024',
        matchType: 'activity_based',
        matchReason: 'Soccer refereeing experience qualifies for National Soccer Association scholarships that 95% of students never discover',
        confidenceScore: 0.92,
        discoverability: 'impossible',
        suggestedAction: 'Contact local soccer association about graduating senior scholarships - many have $500-2000 awards with minimal competition'
      });
    }
    
    // Music/band scholarships from local organizations
    if (activities.some((activity: string) => 
      activity.toLowerCase().includes('band') || 
      activity.toLowerCase().includes('music') ||
      activity.toLowerCase().includes('orchestra')
    )) {
      matches.push({
        scholarshipId: 'local-music-2024',
        matchType: 'activity_based',
        matchReason: 'Music participation opens doors to local arts council, music store, and instrument company scholarships',
        confidenceScore: 0.88,
        discoverability: 'unlikely',
        suggestedAction: 'Visit local music stores, contact arts councils, and check with band directors about "legacy scholarships" from former students'
      });
    }
    
    // Volunteer work leads to organization-specific opportunities
    if (activities.some((activity: string) => 
      activity.toLowerCase().includes('volunteer') || 
      activity.toLowerCase().includes('community service')
    )) {
      matches.push({
        scholarshipId: 'volunteer-org-2024',
        matchType: 'activity_based',
        matchReason: 'Volunteer organizations often have member/volunteer family scholarships with very limited applicant pools',
        confidenceScore: 0.85,
        discoverability: 'difficult',
        suggestedAction: 'Ask volunteer coordinators about scholarships for volunteers or their children - many nonprofits have small scholarship funds'
      });
    }
    
    return matches;
  }
  
  private analyzeLocationFactors(persona: StudentPersona): IntelligentMatch[] {
    const matches: IntelligentMatch[] = [];
    
    // Geographic-specific opportunities
    matches.push({
      scholarshipId: 'local-business-2024',
      matchType: 'location_specific',
      matchReason: 'Local businesses, credit unions, and community foundations offer hyperlocal scholarships with 10-50 applicants',
      confidenceScore: 0.90,
      discoverability: 'difficult',
      suggestedAction: 'Visit chamber of commerce, local banks, credit unions, and ask guidance counselor about "community foundation" scholarships'
    });
    
    // High school specific opportunities
    matches.push({
      scholarshipId: 'alumni-network-2024',
      matchType: 'social_network',
      matchReason: 'School alumni networks often fund small scholarships that only current students hear about through word-of-mouth',
      confidenceScore: 0.83,
      discoverability: 'moderate',
      suggestedAction: 'Connect with school alumni association and ask about "legacy" or "memorial" scholarships from former graduates'
    });
    
    return matches;
  }
  
  private analyzeSocialPotential(persona: StudentPersona): IntelligentMatch[] {
    const matches: IntelligentMatch[] = [];
    
    // Future social media integration discovery
    matches.push({
      scholarshipId: 'social-network-discovery',
      matchType: 'social_network',
      matchReason: 'Social connections reveal corporate scholarships from parents\' employers, family connections, and community networks',
      confidenceScore: 0.75,
      discoverability: 'impossible',
      suggestedAction: 'Ask parents about employer scholarships, family friends about company scholarships, and check LinkedIn connections for corporate opportunities'
    });
    
    return matches;
  }
  
  private analyzeEmploymentConnections(persona: StudentPersona): IntelligentMatch[] {
    const matches: IntelligentMatch[] = [];
    
    // Parent employment opportunities
    matches.push({
      scholarshipId: 'parent-employer-2024',
      matchType: 'employer_based',
      matchReason: 'Parent employers often have employee dependent scholarships with very few applicants',
      confidenceScore: 0.95,
      discoverability: 'moderate',
      suggestedAction: 'Have parents check HR departments for dependent scholarships - many companies offer $1000-5000 awards with minimal competition'
    });
    
    // Local employer opportunities
    matches.push({
      scholarshipId: 'local-employer-2024',
      matchType: 'employer_based',
      matchReason: 'Major local employers often sponsor community scholarships that students overlook',
      confidenceScore: 0.80,
      discoverability: 'unlikely',
      suggestedAction: 'Research top employers in your area and contact their community relations departments about student scholarships'
    });
    
    return matches;
  }
  
  // Generate actionable intelligence report
  generateIntelligenceReport(matches: IntelligentMatch[]): {
    totalHiddenValue: number;
    actionableTips: string[];
    networkingStrategy: string[];
    communityResearch: string[];
  } {
    const hiddenGems = matches.filter(m => m.discoverability === 'impossible' || m.discoverability === 'unlikely');
    
    return {
      totalHiddenValue: hiddenGems.length * 1500, // Estimate average hidden scholarship value
      actionableTips: [
        'Schedule 30 minutes weekly to call local organizations about scholarships',
        'Create a list of all family/friend employer connections to research',
        'Visit local businesses and ask about community scholarships',
        'Contact activity leaders (coaches, directors) about organization scholarships'
      ],
      networkingStrategy: [
        'Ask parents to inquire about dependent scholarships at work',
        'Connect with school alumni through LinkedIn or Facebook',
        'Join local community groups related to your interests',
        'Attend local business networking events with parents'
      ],
      communityResearch: [
        'Visit chamber of commerce for local business scholarship lists',
        'Check community foundation websites for grant opportunities',
        'Research local credit union and bank scholarship programs',
        'Contact city hall about civic organization scholarships'
      ]
    };
  }
}

export const intelligentScout = new IntelligentScholarshipScout();