import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Play, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { JsonPreview } from "./JsonPreview";

interface ExpectEntry {
    type: string;
    intent?: string;
    name?: string;
    arguments?: Record<string, any>;
    output?: string;
}

interface Step {
    user: string;
    expect: ExpectEntry | ExpectEntry[];
}

interface TestCase {
    name: string;
    context: Record<string, any>;
    steps: Step[];
}

interface BotConfig {
    bot: string;
    model: string;
    llm: {
        model: string;
        vertexai: boolean;
        temperature: number;
    };
    cases: TestCase[];
}

const EXPECT_TYPES = [
    { value: "judge", label: "Judge" },
    { value: "function_call", label: "Function Call" },
    { value: "function_output", label: "Function Output" },
];

export const BotTestBuilder = () => {
    const { toast } = useToast();


    const [config, setConfig] = useState<BotConfig>({
        bot: "",
        model: "gemini-2.0-flash-001",
        llm: {
            model: "gemini-2.0-flash-001",
            vertexai: true,
            temperature: 0.0,
        },
        cases: [],
    });

    const addCase = () => {
        const newCase: TestCase = {
            name: "",
            context: {},
            steps: [],
        };
        setConfig(prev => ({
            ...prev,
            cases: [...prev.cases, newCase],
        }));
    };

    const removeCase = (caseIndex: number) => {
        setConfig(prev => ({
            ...prev,
            cases: prev.cases.filter((_, i) => i !== caseIndex),
        }));
    };

    const updateCase = (caseIndex: number, field: keyof TestCase, value: any) => {
        setConfig(prev => ({
            ...prev,
            cases: prev.cases.map((c, i) =>
                i === caseIndex ? { ...c, [field]: value } : c
            ),
        }));
    };

    const addStep = (caseIndex: number) => {
        const newStep: Step = {
            user: "",
            expect: { type: "judge", intent: "" },
        };
        setConfig(prev => ({
            ...prev,
            cases: prev.cases.map((c, i) =>
                i === caseIndex
                    ? { ...c, steps: [...c.steps, newStep] }
                    : c
            ),
        }));
    };

    const removeStep = (caseIndex: number, stepIndex: number) => {
        setConfig(prev => ({
            ...prev,
            cases: prev.cases.map((c, i) =>
                i === caseIndex
                    ? { ...c, steps: c.steps.filter((_, si) => si !== stepIndex) }
                    : c
            ),
        }));
    };

    const updateStep = (caseIndex: number, stepIndex: number, field: keyof Step, value: any) => {
        setConfig(prev => ({
            ...prev,
            cases: prev.cases.map((c, i) =>
                i === caseIndex
                    ? {
                        ...c,
                        steps: c.steps.map((s, si) =>
                            si === stepIndex ? { ...s, [field]: value } : s
                        )
                    }
                    : c
            ),
        }));
    };

    const updateExpect = (
  caseIndex: number,
  stepIndex: number,
  expect: ExpectEntry | ExpectEntry[]
) => {
  // sanitizar antes de guardar
  const sanitize = (exp: ExpectEntry): ExpectEntry => {
    if (exp.type === "judge") {
      return { type: "judge", intent: exp.intent || "" };
    }
    if (exp.type === "function_call") {
      // 🔹 Si exp.arguments existe, lo mantenemos
      // 🔹 Si lo queremos borrar, lo manejamos desde el UI pasándole undefined
      const clean: ExpectEntry = {
        type: "function_call",
        name: exp.name || ""
      };
      if (exp.arguments !== undefined) {
        clean.arguments = exp.arguments;
      }
      return clean;
    }
    if (exp.type === "function_output") {
      return { type: "function_output", output: exp.output || "" };
    }
    return exp;
  };

  const sanitized = Array.isArray(expect)
    ? expect.map(sanitize)
    : sanitize(expect);

  updateStep(caseIndex, stepIndex, "expect", sanitized);
};



    const exportJSON = () => {
        const jsonString = JSON.stringify(config, null, 2);
        navigator.clipboard.writeText(jsonString);
        toast({
            title: "JSON Copiado",
            description: "La configuración se copió al portapapeles",
        });
    };

    const updateContextKey = (caseIndex: number, key: string, value: string) => {
        const newContext = { ...config.cases[caseIndex].context };
        if (value.trim() === "" && newContext.hasOwnProperty(key)) {
            delete newContext[key];
        } else {
            newContext[key] = value;
        }
        updateCase(caseIndex, "context", newContext);
    };

    const addContextKey = (caseIndex: number) => {
        const newKey = `key_${Object.keys(config.cases[caseIndex].context).length + 1}`;
        const newContext = { ...config.cases[caseIndex].context };
        newContext[newKey] = "";
        updateCase(caseIndex, "context", newContext);
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center space-y-4 mb-6">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                        Bot Test Builder
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Construye tests dinámicos para bots con validaciones avanzadas
                    </p>
                </div>

                {/* Main Layout: Form Left, JSON Right */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
                    {/* Left Panel - Form */}
                    <div className="space-y-6 overflow-y-auto pr-2">
                        {/* Bot Configuration */}
                        <Card className="border-border bg-gradient-to-br from-card via-card to-muted/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Play className="w-5 h-5 text-primary" />
                                    Configuración del Bot
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="bot-name">Nombre del Bot</Label>
                                        <Input
                                            id="bot-name"
                                            value={config.bot}
                                            onChange={(e) => setConfig(prev => ({ ...prev, bot: e.target.value }))}
                                            placeholder="Megatone_Mora_Temp_LV-"
                                            className="transition-all duration-300 focus:shadow-glow"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="model">Modelo</Label>
                                        <Select value={config.model} onValueChange={(value) => setConfig(prev => ({ ...prev, model: value }))}>
                                            <SelectTrigger className="transition-all duration-300 focus:shadow-glow">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="gemini-2.0-flash-001">Gemini 2.0 Flash</SelectItem>
                                                <SelectItem value="gpt-4">GPT-4</SelectItem>
                                                <SelectItem value="claude-3">Claude 3</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="temperature">Temperature</Label>
                                        <Input
                                            id="temperature"
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="2"
                                            value={config.llm.temperature}
                                            onChange={(e) => setConfig(prev => ({
                                                ...prev,
                                                llm: { ...prev.llm, temperature: parseFloat(e.target.value) || 0 }
                                            }))}
                                            className="transition-all duration-300 focus:shadow-glow"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Test Cases */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold">Test Cases</h2>
                                <Button onClick={addCase} className="bg-primary hover:bg-primary-glow transition-all duration-300">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Agregar Case
                                </Button>
                            </div>

                            {config.cases.map((testCase, caseIndex) => (
                                <Card key={caseIndex} className="border-border bg-gradient-to-br from-card via-card to-muted/50">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-primary border-primary">
                                                    Case {caseIndex + 1}
                                                </Badge>
                                            </CardTitle>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeCase(caseIndex)}
                                                className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Case Name */}
                                        <div>
                                            <Label htmlFor={`case-name-${caseIndex}`}>Nombre del Case</Label>
                                            <Input
                                                id={`case-name-${caseIndex}`}
                                                value={testCase.name}
                                                onChange={(e) => updateCase(caseIndex, "name", e.target.value)}
                                                placeholder="compromiso_pago_total"
                                                className="transition-all duration-300 focus:shadow-glow"
                                            />
                                        </div>

                                        {/* Context */}
                                        <div>
                                            <Label>Context</Label>
                                            <div className="space-y-2">
                                                {Object.entries(testCase.context).map(([key, value], index) => (
                                                    <div key={index} className="flex gap-2">
                                                        <Input
                                                            value={key}
                                                            onChange={(e) => {
                                                                const newContext = { ...testCase.context };
                                                                delete newContext[key];
                                                                newContext[e.target.value] = value;
                                                                updateCase(caseIndex, "context", newContext);
                                                            }}
                                                            placeholder="clave"
                                                            className="w-1/3"
                                                        />
                                                        <Input
                                                            value={value as string}
                                                            onChange={(e) => updateContextKey(caseIndex, key, e.target.value)}
                                                            placeholder="valor"
                                                            className="flex-1"
                                                        />
                                                    </div>
                                                ))}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addContextKey(caseIndex)}
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Agregar Context
                                                </Button>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Steps */}
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <Label className="text-lg font-semibold">Steps</Label>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addStep(caseIndex)}
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Agregar Step
                                                </Button>
                                            </div>

                                            {testCase.steps.map((step, stepIndex) => (
                                                <Card key={stepIndex} className="mb-4 border-muted">
                                                    <CardHeader className="pb-3">
                                                        <div className="flex items-center justify-between">
                                                            <Badge variant="secondary">Step {stepIndex + 1}</Badge>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeStep(caseIndex, stepIndex)}
                                                                className="text-destructive"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        <div>
                                                            <Label>User Input</Label>
                                                            <Textarea
                                                                value={step.user}
                                                                onChange={(e) => updateStep(caseIndex, stepIndex, "user", e.target.value)}
                                                                placeholder="Si te pago el total hoy a la tarde"
                                                                className="transition-all duration-300 focus:shadow-glow"
                                                            />
                                                        </div>

                                                        <div>
                                                            <Label>Expected Response</Label>
                                                            <ExpectBuilder
                                                                expect={step.expect}
                                                                onChange={(expect) => updateExpect(caseIndex, stepIndex, expect)}
                                                            />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Export Button */}
                        <div className="flex justify-center pb-6">
                            <Button
                                onClick={exportJSON}
                                size="lg"
                                className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow transition-all duration-300"
                            >
                                <Copy className="w-4 h-4 mr-2" />
                                Copiar JSON
                            </Button>
                        </div>
                    </div>

                    {/* Right Panel - JSON Preview */}
                    <div className="lg:sticky lg:top-6 h-full">
                        <JsonPreview config={config} />
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ExpectBuilderProps {
    expect: ExpectEntry | ExpectEntry[];
    onChange: (expect: ExpectEntry | ExpectEntry[]) => void;
}

const ExpectBuilder = ({ expect, onChange }: ExpectBuilderProps) => {
    const isArray = Array.isArray(expect);
    const expectArray = isArray ? expect : [expect];

    const addExpect = () => {
        const newExpect: ExpectEntry = { type: "judge", intent: "" };
        onChange([...expectArray, newExpect]);
    };

    const removeExpect = (index: number) => {
        const newArray = expectArray.filter((_, i) => i !== index);
        onChange(newArray.length === 1 ? newArray[0] : newArray);
    };

    const updateExpect = (index: number, field: keyof ExpectEntry, value: any) => {
        const newArray = expectArray.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        onChange(newArray.length === 1 && !isArray ? newArray[0] : newArray);
    };

    return (
        <div className="space-y-3">
            {expectArray.map((item, index) => (
                <Card key={index} className="border-accent bg-accent/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <Badge variant="outline" className="text-info border-info">
                                Expect {index + 1}
                            </Badge>
                            {expectArray.length > 1 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeExpect(index)}
                                    className="text-destructive"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <Label>Type</Label>
                                <Select
                                    value={item.type}
                                    onValueChange={(value) => updateExpect(index, "type", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EXPECT_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {item.type === "judge" && (
                                <div>
                                    <Label>Intent</Label>
                                    <Input
                                        value={item.intent || ""}
                                        onChange={(e) => updateExpect(index, "intent", e.target.value)}
                                        placeholder="Informs debt amount and asks for payment commitment."
                                    />
                                </div>
                            )}

                            {item.type === "function_call" && (
  <>
    <div>
      <Label>Function Name</Label>
      <Select
        value={item.name || ""}
        onValueChange={(value) => updateExpect(index, "name", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecciona una función..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="end_call">Finalizar llamada</SelectItem>
          <SelectItem value="transfer_call">Transferir llamada</SelectItem>
          <SelectItem value="validar_fecha_compromiso">Validar fecha</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {item.arguments ? (
      <div className="md:col-span-2">
        <Label>Arguments (input_text)</Label>
        <Textarea
          value={item.arguments.input_text || ""}
          onChange={(e) =>
            updateExpect(index, "arguments", { input_text: e.target.value })
          }
          placeholder="hoy a la tarde"
          className="font-mono"
        />
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 text-destructive"
          onClick={() => updateExpect(index, "arguments", undefined)}
        >
          ❌ Quitar Arguments
        </Button>
      </div>
    ) : (
      <Button
        variant="outline"
        size="sm"
        className="md:col-span-2"
        onClick={() => updateExpect(index, "arguments", { input_text: "" })}
      >
        ➕ Agregar Argumentos
      </Button>
    )}
  </>
)}


                            {item.type === "function_output" && (
                                <div>
                                    <Label>Output</Label>
                                    <Input
                                        value={item.output || ""}
                                        onChange={(e) => updateExpect(index, "output", e.target.value)}
                                        placeholder="La fecha es válida"
                                    />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}

            <Button
                variant="outline"
                size="sm"
                onClick={addExpect}
                className="w-full border-dashed"
            >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Expected
            </Button>
        </div>
    );
};