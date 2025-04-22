
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IndividualUsageCalculator } from "@/components/IndividualUsageCalculator";
import { SharedUsageCalculator } from "@/components/SharedUsageCalculator";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [activeTab, setActiveTab] = React.useState("individual");
  const [personalUsage, setPersonalUsage] = React.useState<number | null>(null);
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="container px-3 md:px-4 mx-auto max-w-3xl">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">WattShare - Electricity Usage Calculator</h1>
          <p className="text-sm md:text-base text-gray-600">
            Upload meter readings and calculate your electricity usage
          </p>
        </div>
        
        <Tabs 
          defaultValue="individual" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex justify-center mb-4 md:mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="individual">Individual Usage</TabsTrigger>
              <TabsTrigger value="shared">Shared Usage</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="individual" className="mt-0">
            <IndividualUsageCalculator onUsageCalculated={setPersonalUsage} />
          </TabsContent>
          
          <TabsContent value="shared" className="mt-0">
            <SharedUsageCalculator personalUsage={personalUsage} />
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 md:mt-8 text-center text-xs md:text-sm text-gray-500">
          <p>
            WattShare helps you manage and calculate electricity usage from meter readings.
          </p>
          <p className="mt-1">
            Upload images of your meter and our OCR technology will read the values automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
