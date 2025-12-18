import React, { useState } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { useTemplateStore } from "@/store/templateStore";

const TemplateTestComponent: React.FC = () => {
  const [customerId, setCustomerId] = useState("");
  const { customerTemplate, loading, fetchCustomerTemplate, createCustomerTemplate } = useTemplateStore();

  const handleTest = async () => {
    if (!customerId) return;
    
    try {
      await fetchCustomerTemplate(customerId);
    } catch (error) {
      console.error("Test error:", error);
    }
  };

  const handleCreateTest = async () => {
    if (!customerId) return;
    
    try {
      await createCustomerTemplate(customerId, ["Container", "Goods Description", "Weight", "Instructions"]);
    } catch (error) {
      console.error("Create test error:", error);
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Template Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Enter Customer ID"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
        />
        <div className="flex gap-2">
          <Button onClick={handleTest} disabled={loading || !customerId}>
            {loading ? "Loading..." : "Fetch Template"}
          </Button>
          <Button onClick={handleCreateTest} disabled={loading || !customerId}>
            Create Test Template
          </Button>
        </div>
        {customerTemplate && (
          <div className="mt-4 p-3 bg-muted rounded">
            <p className="font-medium">Template Found:</p>
            <ul className="list-disc list-inside">
              {customerTemplate.templateLines.map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TemplateTestComponent;