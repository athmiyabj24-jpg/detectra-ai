'use client';

import { useState, useCallback } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Upload, 
  X, 
  Search,
  Building2,
  Loader2 
} from 'lucide-react';
import { useApp } from '@/lib/store';
import type { InputType, AnalysisResult } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { AnalysisResults } from '@/components/user/analysis-results';
import { ProcessingSteps } from '@/components/user/processing-steps';
import { analyzeClaimSimulated } from '@/lib/ai/analyzer';

export default function AnalyzePage() {
  const { state, addAnalysis } = useApp();
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [companyOpen, setCompanyOpen] = useState(false);
  const [inputType, setInputType] = useState<InputType>('text');
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const selectedCompanyData = state.companies.find((c) => c.id === selectedCompany);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleAnalyze = async () => {
    if (!selectedCompanyData) return;
    
    let inputText = '';
    if (inputType === 'text') {
      if (!textInput.trim()) return;
      inputText = textInput;
    } else if (file) {
      inputText = `[${inputType.toUpperCase()} FILE: ${file.name}]`;
    } else {
      return;
    }

    setIsProcessing(true);
    setProcessingStep(0);
    setResult(null);

    try {
      const analysisResult = await analyzeClaimSimulated(
        inputText,
        inputType,
        selectedCompanyData,
        (step) => setProcessingStep(step)
      );

      setResult(analysisResult);
      addAnalysis(analysisResult);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setTextInput('');
    setFile(null);
    setProcessingStep(0);
  };

  const canSubmit = selectedCompanyData && (
    (inputType === 'text' && textInput.trim()) ||
    ((inputType === 'image' || inputType === 'video') && file)
  );

  if (result) {
    return (
      <div className="p-6">
        <AnalysisResults result={result} onNewAnalysis={handleReset} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Analyze Claim</h1>
        <p className="text-muted-foreground">
          Enter a sustainability claim to analyze for potential greenwashing
        </p>
      </div>

      {isProcessing ? (
        <ProcessingSteps currentStep={processingStep} inputType={inputType} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Company</CardTitle>
                <CardDescription>
                  Choose the company whose claim you want to analyze
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={companyOpen}
                      className="w-full justify-between"
                    >
                      {selectedCompanyData ? (
                        <span className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {selectedCompanyData.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Select a company...</span>
                      )}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search companies..." />
                      <CommandList>
                        <CommandEmpty>No company found.</CommandEmpty>
                        <CommandGroup>
                          {state.companies.map((company) => (
                            <CommandItem
                              key={company.id}
                              value={company.name}
                              onSelect={() => {
                                setSelectedCompany(company.id);
                                setCompanyOpen(false);
                              }}
                            >
                              <div>
                                <p className="font-medium">{company.name}</p>
                                <p className="text-xs text-muted-foreground">{company.industry}</p>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>

            {/* Claim Input */}
            <Card>
              <CardHeader>
                <CardTitle>Claim Input</CardTitle>
                <CardDescription>
                  Enter the sustainability claim via text, image, or video
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={inputType} onValueChange={(v) => setInputType(v as InputType)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="text" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Text
                    </TabsTrigger>
                    <TabsTrigger value="image" className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Image
                    </TabsTrigger>
                    <TabsTrigger value="video" className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Video
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="mt-4">
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="claim-text">Sustainability Claim</FieldLabel>
                        <Textarea
                          id="claim-text"
                          placeholder="Enter the sustainability claim you want to analyze..."
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          rows={6}
                          className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Example: &quot;Our products are 100% eco-friendly and completely sustainable.&quot;
                        </p>
                      </Field>
                    </FieldGroup>
                  </TabsContent>

                  <TabsContent value="image" className="mt-4">
                    <FileUploadZone
                      file={file}
                      onFileChange={handleFileChange}
                      onRemove={handleRemoveFile}
                      accept="image/*"
                      description="Upload an image of a sustainability claim (product label, advertisement, etc.)"
                    />
                  </TabsContent>

                  <TabsContent value="video" className="mt-4">
                    <FileUploadZone
                      file={file}
                      onFileChange={handleFileChange}
                      onRemove={handleRemoveFile}
                      accept="video/*"
                      description="Upload a video containing sustainability claims (commercial, announcement, etc.)"
                    />
                  </TabsContent>
                </Tabs>

                <Button
                  className="w-full mt-6"
                  size="lg"
                  disabled={!canSubmit}
                  onClick={handleAnalyze}
                >
                  <Search className="mr-2 h-5 w-5" />
                  Analyze Claim
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            {selectedCompanyData && (
              <Card>
                <CardHeader>
                  <CardTitle>Company Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Industry</p>
                    <p className="font-medium">{selectedCompanyData.industry}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Historical Claims</p>
                    <p className="font-medium">{selectedCompanyData.historicalClaims.length} on record</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Certifications</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedCompanyData.sustainabilityCertifications.length > 0 ? (
                        selectedCompanyData.sustainabilityCertifications.map((cert) => (
                          <span
                            key={cert}
                            className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs text-primary"
                          >
                            {cert}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Analysis Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>NLP-based claim classification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Historical claim comparison</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Greenwashing risk scoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Suspicious phrase detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Sustainability standards check</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function FileUploadZone({
  file,
  onFileChange,
  onRemove,
  accept,
  description,
}: {
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  accept: string;
  description: string;
}) {
  return (
    <div>
      {file ? (
        <div className="flex items-center justify-between rounded-lg border bg-secondary/30 p-4">
          <div className="flex items-center gap-3">
            {accept.includes('image') ? (
              <ImageIcon className="h-8 w-8 text-primary" />
            ) : (
              <Video className="h-8 w-8 text-primary" />
            )}
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/20 p-8 transition-colors hover:bg-secondary/40">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">Click to upload or drag and drop</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          <input type="file" className="hidden" accept={accept} onChange={onFileChange} />
        </label>
      )}
    </div>
  );
}
