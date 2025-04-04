import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { REPLIT_DEPLOYMENT_GUIDE } from "utils/replitDeploymentGuide";
import Navbar from "components/Navbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CodeBlock } from "components/CodeBlock";

const DeploymentGuide = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          ← Back
        </Button>

        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h1 className="text-3xl font-bold text-gray-900">{REPLIT_DEPLOYMENT_GUIDE.title}</h1>
            <p className="mt-2 text-gray-600">
              Follow this guide to deploy Ahadu Market on Replit
            </p>
          </div>

          <ScrollArea className="p-6 h-[calc(100vh-250px)]">
            <div className="space-y-8">
              {REPLIT_DEPLOYMENT_GUIDE.sections.map((section, index) => (
                <div key={index} className="pb-6 border-b border-gray-200 last:border-0">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">{section.title}</h2>
                  <div className="space-y-3">
                    {section.content.map((item, i) => {
                      if (item.startsWith("```")) {
                        // This is the start of a code block
                        const language = item.replace("```", "").trim();
                        let codeContent = [];
                        let j = i + 1;
                        while (j < section.content.length && !section.content[j].startsWith("```")) {
                          codeContent.push(section.content[j]);
                          j++;
                        }
                        return (
                          <CodeBlock 
                            key={i} 
                            language={language || "bash"} 
                            code={codeContent.join("\n")}
                          />
                        );
                      } else if (item === "" || i + 1 < section.content.length && section.content[i + 1].startsWith("```")) {
                        // Skip empty lines or lines right before code blocks
                        return null;
                      } else if (item.startsWith("-")) {
                        return <div key={i} className="ml-4">{item}</div>;
                      } else {
                        return <p key={i} className="text-gray-700">{item}</p>;
                      }
                    }).filter(Boolean)}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-6 border-t bg-gray-50">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                If you have any questions, please contact support.
              </p>
              <Button onClick={() => window.print()}>
                Print Guide
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentGuide;
