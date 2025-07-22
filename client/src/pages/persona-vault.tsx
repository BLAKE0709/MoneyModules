import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Clock, CheckCircle2, AlertCircle, Eye, Trash2, Search, BarChart3, Brain, TrendingUp } from "lucide-react";

interface PersonaFile {
  id: string;
  filename: string;
  wordCount: number;
  readingLevel: number;
  sourceClass: string;
  status: string;
  type: string;
  createdAt: string;
}

interface PersonaFilesResponse {
  files: PersonaFile[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export default function PersonaVault() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("files");

  // Fetch persona files
  const { data: files, isLoading } = useQuery<PersonaFilesResponse>({
    queryKey: ["/api/persona/list"],
    enabled: !!user,
  });

  // Fetch writing style analysis
  const { data: writingAnalysis, isLoading: analysisLoading } = useQuery({
    queryKey: ["/api/persona/analysis/writing-style"],
    enabled: !!user,
  });

  // Search functionality
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["/api/persona/search", searchQuery],
    enabled: !!user && searchQuery.length > 2,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setIsUploading(true);
      setUploadProgress(0);

      const response = await fetch("/api/persona/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload Started",
        description: `File "${data.filename}" is being processed. You'll see the results in a few moments.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/persona/list"] });
      setIsUploading(false);
      setUploadProgress(100);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsUploading(false);
      setUploadProgress(0);
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Only PDF, DOCX, and TXT files are supported.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 10MB.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'document');
    formData.append('sourceClass', 'personal_note');

    uploadMutation.mutate(formData);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return <div>Please log in to access the Persona Vault.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Persona Vault</h1>
          <p className="text-gray-600 mt-2">
            Upload your documents to build your AI persona. The system analyzes your writing style and creates searchable insights.
          </p>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="files" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Files ({files?.total || 0})
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Style Analysis
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-6">

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload" className="block text-sm font-medium mb-2">
                Select File (PDF, DOCX, or TXT - Max 10MB)
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            <div className="text-sm text-gray-500">
              <p><strong>Supported formats:</strong> PDF, Microsoft Word (.docx), Plain Text (.txt)</p>
              <p><strong>Processing:</strong> Files are analyzed for text extraction, reading level, and vector embeddings</p>
              <p><strong>Usage:</strong> These documents help the AI understand your writing style and preferences</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : files?.files?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No documents uploaded yet</p>
              <p className="text-sm">Upload your first document to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {files?.files?.map((file: PersonaFile) => (
                <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(file.status)}
                    <div>
                      <h3 className="font-medium">{file.filename}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{file.wordCount || 0} words</span>
                        {file.readingLevel && <span>Grade {file.readingLevel} reading level</span>}
                        <span className="capitalize">{file.type}</span>
                        <Badge className={getStatusColor(file.status)}>
                          {file.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // TODO: Implement view details
                        toast({
                          title: "View Details",
                          description: "File details view coming soon!",
                        });
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      {files?.files?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vault Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{files.total}</div>
                <div className="text-sm text-gray-500">Total Files</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {files.files.filter((f: PersonaFile) => f.status === 'processed').length}
                </div>
                <div className="text-sm text-gray-500">Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {files.files.filter((f: PersonaFile) => f.status === 'processing').length}
                </div>
                <div className="text-sm text-gray-500">Processing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {files.files.reduce((sum: number, f: PersonaFile) => sum + (f.wordCount || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total Words</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
        
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Semantic Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="search-query">Search your documents</Label>
                <Input
                  id="search-query"
                  placeholder="Enter keywords or topics to search for..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-2"
                />
              </div>
              
              {searchQuery.length > 2 && (
                <div className="space-y-4">
                  {searchLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Searching...</p>
                    </div>
                  ) : searchResults?.results?.length > 0 ? (
                    <div className="space-y-3">
                      <h3 className="font-medium">Search Results ({searchResults.totalFound})</h3>
                      {searchResults.results.map((result: any) => (
                        <div key={result.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{result.filename}</h4>
                            <Badge variant="secondary">{Math.round(result.similarity * 100)}% match</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {result.wordCount} words • Grade {result.readingLevel} reading level
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery.length > 2 ? (
                    <div className="text-center py-4 text-gray-500">
                      <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No results found for "{searchQuery}"</p>
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Writing Style Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Writing Style Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysisLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Analyzing writing style...</p>
                </div>
              ) : writingAnalysis ? (
                <div className="space-y-6">
                  {/* Core Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{writingAnalysis.totalDocuments}</div>
                      <div className="text-sm text-gray-500">Documents</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{writingAnalysis.totalWords?.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Total Words</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{writingAnalysis.averageWordCount}</div>
                      <div className="text-sm text-gray-500">Avg Words/Doc</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{writingAnalysis.averageReadingLevel}</div>
                      <div className="text-sm text-gray-500">Reading Level</div>
                    </div>
                  </div>

                  <Separator />

                  {/* Writing Complexity */}
                  <div>
                    <h3 className="font-medium mb-3">Vocabulary Complexity</h3>
                    <div className="flex items-center gap-4">
                      <Badge variant={
                        writingAnalysis.vocabularyComplexity === 'graduate_level' ? 'default' :
                        writingAnalysis.vocabularyComplexity === 'advanced' ? 'secondary' :
                        writingAnalysis.vocabularyComplexity === 'intermediate' ? 'outline' : 'destructive'
                      }>
                        {writingAnalysis.vocabularyComplexity?.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Based on reading level analysis across all documents
                      </span>
                    </div>
                  </div>

                  {/* Writing Styles */}
                  {writingAnalysis.writingStyles?.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3">Detected Writing Styles</h3>
                      <div className="flex flex-wrap gap-2">
                        {writingAnalysis.writingStyles.map((style: string, index: number) => (
                          <Badge key={index} variant="outline">{style}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Theme Analysis */}
                  {writingAnalysis.themeAnalysis && (
                    <div>
                      <h3 className="font-medium mb-3">Theme Analysis</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {writingAnalysis.themeAnalysis}
                      </p>
                    </div>
                  )}

                  {/* Strengths and Areas for Improvement */}
                  {writingAnalysis.strengthsAndWeaknesses && (
                    <div className="grid md:grid-cols-2 gap-6">
                      {writingAnalysis.strengthsAndWeaknesses.strengths && (
                        <div>
                          <h3 className="font-medium mb-3 text-green-600">Strengths</h3>
                          <ul className="space-y-2">
                            {writingAnalysis.strengthsAndWeaknesses.strengths.map((strength: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {writingAnalysis.strengthsAndWeaknesses.areas_for_improvement && (
                        <div>
                          <h3 className="font-medium mb-3 text-orange-600">Areas for Growth</h3>
                          <ul className="space-y-2">
                            {writingAnalysis.strengthsAndWeaknesses.areas_for_improvement.map((area: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <TrendingUp className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{area}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Upload some documents to see your writing style analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Persona Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-2">AI-Powered Persona Building</h3>
                    <p className="opacity-90">
                      Your documents are being processed to create a comprehensive AI persona that understands your writing style, interests, and voice.
                    </p>
                  </div>
                </div>

                {files?.total > 0 && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">
                        {files.files?.filter((f: PersonaFile) => f.status === 'processed').length || 0}
                      </div>
                      <div className="text-sm text-blue-700 mt-1">Documents Processed</div>
                      <div className="text-xs text-blue-600 mt-1">
                        Ready for AI analysis
                      </div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">
                        {files.files?.reduce((sum: number, f: PersonaFile) => sum + (f.wordCount || 0), 0).toLocaleString() || 0}
                      </div>
                      <div className="text-sm text-green-700 mt-1">Words Analyzed</div>
                      <div className="text-xs text-green-600 mt-1">
                        Building your voice signature
                      </div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">
                        {Math.round((files.files?.filter((f: PersonaFile) => f.status === 'processed').length / files.total) * 100) || 0}%
                      </div>
                      <div className="text-sm text-purple-700 mt-1">Completion</div>
                      <div className="text-xs text-purple-600 mt-1">
                        Persona development progress
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">🎯 How This Helps Your Applications</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• <strong>Essay Enhancement:</strong> AI understands your natural writing style for authentic suggestions</li>
                    <li>• <strong>Scholarship Matching:</strong> Better matching based on your demonstrated interests and experiences</li>
                    <li>• <strong>Voice Preservation:</strong> Maintain your unique voice while getting AI assistance</li>
                    <li>• <strong>Portfolio Building:</strong> Create a comprehensive academic and personal profile</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}