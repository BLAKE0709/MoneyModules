import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo and branding */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center shadow-material-lg">
            <svg 
              className="w-8 h-8 text-white" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 3L1 9v6c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V9l-11-6z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-neutral-800">StudentOS</h1>
        </div>

        {/* Hero content */}
        <Card className="shadow-material-lg border-0 mb-8">
          <CardContent className="p-12">
            <h2 className="text-3xl font-bold text-neutral-800 mb-4">
              Your AI-Powered Educational Journey Starts Here
            </h2>
            <p className="text-xl text-neutral-600 mb-8 font-source max-w-2xl mx-auto">
              Transform your college application process with intelligent essay polishing, 
              personalized scholarship matching, and comprehensive student persona management.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.17 13.71l1.4-2.42c.09-.15.05-.34-.08-.45L12 8.5 8.51 10.84c-.13.11-.17.3-.08.45l1.4 2.42L7 15.66c-.21.35-.03.8.4.8h9.2c.43 0 .61-.45.4-.8l-2.83-1.95z"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-neutral-800 mb-2">AI Essay Polish</h3>
                <p className="text-sm text-neutral-600">Get intelligent feedback and suggestions to make your essays shine</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-secondary bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-neutral-800 mb-2">Smart Matching</h3>
                <p className="text-sm text-neutral-600">Find scholarships perfectly tailored to your profile and goals</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-accent bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-neutral-800 mb-2">Admin Dashboard</h3>
                <p className="text-sm text-neutral-600">Comprehensive analytics and management tools for educators</p>
              </div>
            </div>

            <Button 
              size="lg" 
              className="bg-primary hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium shadow-material"
              onClick={() => window.location.href = "/api/login"}
            >
              Get Started with StudentOS
            </Button>
          </CardContent>
        </Card>

        {/* Trust indicators */}
        <div className="text-center text-neutral-600">
          <p className="text-sm font-source">
            Trusted by students, counselors, and administrators nationwide
          </p>
          <div className="flex items-center justify-center space-x-6 mt-4 text-xs">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span>FERPA Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18,8A6,6 0 0,0 12,2A6,6 0 0,0 6,8V10H4A2,2 0 0,0 2,12V20A2,2 0 0,0 4,22H20A2,2 0 0,0 22,20V12A2,2 0 0,0 20,10H18V8Z"/>
              </svg>
              <span>Data Encrypted</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
              </svg>
              <span>AI-Powered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
