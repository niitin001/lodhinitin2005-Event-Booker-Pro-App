import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sparkles, Calculator, Instagram, PackageSearch } from "lucide-react";
import { useAiCostEstimate } from "@workspace/api-client-react";

export default function AIHub() {
  const [estimateData, setEstimateData] = useState({
    eventType: "",
    city: "",
    durationHours: 4,
    guestCount: 50,
  });

  const estimateMutation = useAiCostEstimate();

  const handleEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estimateData.eventType || !estimateData.city) return;
    
    estimateMutation.mutate({
      data: estimateData
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />
      
      <main className="flex-1 container mx-auto max-w-7xl px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-serif font-bold tracking-tight mb-4 flex items-center justify-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" /> AI Tools for Creatives
          </h1>
          <p className="text-lg text-muted-foreground">
            Leverage AI to estimate costs, recommend the perfect package, and generate engaging content for your portfolio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* AI Cost Estimator */}
          <Card className="lg:col-span-2 border-primary/20 shadow-md">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" /> Cost Estimator
              </CardTitle>
              <CardDescription>Get an instant, data-driven cost estimate for your event.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleEstimate} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <Select value={estimateData.eventType} onValueChange={(v) => setEstimateData({...estimateData, eventType: v})}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="birthday">Birthday Party</SelectItem>
                      <SelectItem value="fashion">Fashion Shoot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input 
                    placeholder="e.g. Los Angeles" 
                    value={estimateData.city}
                    onChange={(e) => setEstimateData({...estimateData, city: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (Hours)</Label>
                  <Input 
                    type="number" 
                    value={estimateData.durationHours}
                    onChange={(e) => setEstimateData({...estimateData, durationHours: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Guest Count</Label>
                  <Input 
                    type="number" 
                    value={estimateData.guestCount}
                    onChange={(e) => setEstimateData({...estimateData, guestCount: Number(e.target.value)})}
                  />
                </div>
                <div className="sm:col-span-2 pt-2">
                  <Button type="submit" className="w-full" disabled={estimateMutation.isPending}>
                    {estimateMutation.isPending ? "Calculating..." : "Generate Estimate"}
                  </Button>
                </div>
              </form>

              {estimateMutation.isSuccess && estimateMutation.data && (
                <div className="bg-muted rounded-lg p-5 border">
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wider">Estimated Cost</h4>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-3xl font-bold">${estimateMutation.data.minEstimate}</span>
                    <span className="text-xl text-muted-foreground mb-1">- ${estimateMutation.data.maxEstimate}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {estimateMutation.data.explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Other tools stubs */}
          <div className="space-y-8">
            <Card className="opacity-75 hover:opacity-100 transition-opacity">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Instagram className="h-5 w-5" /> Caption Generator
                </CardTitle>
                <CardDescription>Generate engaging Instagram captions for your deliverables.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">Coming Soon</Button>
              </CardContent>
            </Card>

            <Card className="opacity-75 hover:opacity-100 transition-opacity">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PackageSearch className="h-5 w-5" /> Package Recommender
                </CardTitle>
                <CardDescription>Upload a moodboard and get AI package recommendations.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">Coming Soon</Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
