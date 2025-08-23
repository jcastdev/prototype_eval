import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface BotConfig {
  bot: string;
  model: string;
  llm: {
    model: string;
    vertexai: boolean;
    temperature: number;
  };
  cases: any[];
}

interface JsonPreviewProps {
  config: BotConfig;
}

export const JsonPreview = ({ config }: JsonPreviewProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const jsonString = JSON.stringify(config, null, 2);
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "JSON Copiado",
      description: "La configuración se copió al portapapeles",
    });
  };

  const jsonString = JSON.stringify(config, null, 2);
  const hasContent = config.bot || config.cases.length > 0;

  // Calculate stats
  const totalSteps = config.cases.reduce((acc, testCase) => acc + testCase.steps.length, 0);
  const totalExpects = config.cases.reduce((acc, testCase) => 
    acc + testCase.steps.reduce((stepAcc: number, step: any) => 
      stepAcc + (Array.isArray(step.expect) ? step.expect.length : 1), 0
    ), 0
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header with stats */}
      <Card className="border-border bg-gradient-to-br from-card via-card to-muted/50 mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="w-5 h-5 text-primary" />
              JSON Preview
            </CardTitle>
            <Button
              onClick={copyToClipboard}
              size="sm"
              disabled={!hasContent}
              className="bg-primary hover:bg-primary-glow transition-all duration-300"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? "¡Copiado!" : "Copiar"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-info border-info">
              {config.cases.length} Cases
            </Badge>
            <Badge variant="outline" className="text-success border-success">
              {totalSteps} Steps
            </Badge>
            <Badge variant="outline" className="text-warning border-warning">
              {totalExpects} Expects
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* JSON Content */}
      <Card className="flex-1 border-border bg-gradient-to-br from-card via-card to-muted/50">
        <CardContent className="p-0 h-full">
          {hasContent ? (
            <pre className="h-full overflow-auto p-4 text-sm font-mono text-foreground bg-transparent">
              <code className="text-foreground">{jsonString}</code>
            </pre>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-8">
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Eye className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  JSON vacío
                </h3>
                <p className="text-muted-foreground max-w-xs">
                  Comienza agregando un nombre de bot y test cases para ver el JSON generado aquí
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};