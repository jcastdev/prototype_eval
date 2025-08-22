import React, { useState } from "react";

type Expect = {
  type: string;
  name?: string;
  arguments?: Record<string, any>;
};

type Step = {
  user: string;
  expect: Expect[];
};

type TestCase = {
  name: string;
  context: Record<string, any>;
  steps: Step[];
};

function App() {
  const [bot, setBot] = useState("Megatone_Mora_Temp_LV-");
  const [model, setModel] = useState("gemini-2.0-flash-001");
  const [cases, setCases] = useState<TestCase[]>([]);

  const addCase = () => {
    setCases([
      ...cases,
      { name: "", context: {}, steps: [] }
    ]);
  };

  const addStep = (caseIndex: number) => {
    const updated = [...cases];
    updated[caseIndex].steps.push({ user: "", expect: [] });
    setCases(updated);
  };

  const addExpect = (caseIndex: number, stepIndex: number) => {
    const updated = [...cases];
    updated[caseIndex].steps[stepIndex].expect.push({ type: "", name: "", arguments: {} });
    setCases(updated);
  };

  const exportJSON = () => {
    const result = {
      bot,
      model,
      llm: { model, vertexai: true, temperature: 0.0 },
      cases
    };
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tests.json";
    a.click();
  };

  return (
    <div className="p-4">
      <h1>Generador de Tests Dinámicos</h1>

      <div>
        <label>Bot:</label>
        <input value={bot} onChange={e => setBot(e.target.value)} />
        <label>Model:</label>
        <input value={model} onChange={e => setModel(e.target.value)} />
      </div>

      <button onClick={addCase}>➕ Agregar Caso</button>

      {cases.map((c, i) => (
        <div key={i} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
          <input
            placeholder="Nombre del caso"
            value={c.name}
            onChange={e => {
              const updated = [...cases];
              updated[i].name = e.target.value;
              setCases(updated);
            }}
          />
          <button onClick={() => addStep(i)}>➕ Agregar Step</button>

          {c.steps.map((s, j) => (
            <div key={j} style={{ marginLeft: "20px" }}>
              <input
                placeholder="Mensaje del usuario"
                value={s.user}
                onChange={e => {
                  const updated = [...cases];
                  updated[i].steps[j].user = e.target.value;
                  setCases(updated);
                }}
              />
              <button onClick={() => addExpect(i, j)}>➕ Agregar Expect</button>

              {s.expect.map((ex, k) => (
                <div key={k} style={{ marginLeft: "20px" }}>
                  <input
                    placeholder="Tipo"
                    value={ex.type}
                    onChange={e => {
                      const updated = [...cases];
                      updated[i].steps[j].expect[k].type = e.target.value;
                      setCases(updated);
                    }}
                  />
                  <input
                    placeholder="Nombre (si aplica)"
                    value={ex.name || ""}
                    onChange={e => {
                      const updated = [...cases];
                      updated[i].steps[j].expect[k].name = e.target.value;
                      setCases(updated);
                    }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      <button onClick={exportJSON}>⬇️ Exportar JSON</button>

      <pre>{JSON.stringify({ bot, model, llm: { model, vertexai: true, temperature: 0.0 }, cases }, null, 2)}</pre>
    </div>
  );
}

export default App;