import { useState } from "react";

type Expect = {
  type: string;
  name?: string;
  args?: Record<string, any>;
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
    setCases(prev => [...prev, { name: "", context: {}, steps: [] }]);
  };

  const addStep = (caseIndex: number) => {
    setCases(prev =>
      prev.map((c, i) =>
        i === caseIndex
          ? { ...c, steps: [...c.steps, { user: "", expect: [] }] }
          : c
      )
    );
  };

  const addExpect = (caseIndex: number, stepIndex: number) => {
    setCases(prev =>
      prev.map((c, i) =>
        i === caseIndex
          ? {
              ...c,
              steps: c.steps.map((s, j) =>
                j === stepIndex
                  ? { ...s, expect: [...s.expect, { type: "", name: "", args: {} }] }
                  : s
              )
            }
          : c
      )
    );
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
            onChange={e =>
              setCases(prev =>
                prev.map((cc, idx) =>
                  idx === i ? { ...cc, name: e.target.value } : cc
                )
              )
            }
          />
          <button onClick={() => addStep(i)}>➕ Agregar Step</button>

          {c.steps.map((s, j) => (
            <div key={j} style={{ marginLeft: "20px" }}>
              <input
                placeholder="Mensaje del usuario"
                value={s.user}
                onChange={e =>
                  setCases(prev =>
                    prev.map((cc, idx) =>
                      idx === i
                        ? {
                            ...cc,
                            steps: cc.steps.map((ss, jj) =>
                              jj === j ? { ...ss, user: e.target.value } : ss
                            )
                          }
                        : cc
                    )
                  )
                }
              />
              <button onClick={() => addExpect(i, j)}>➕ Agregar Expect</button>

              {s.expect.map((ex, k) => (
                <div key={k} style={{ marginLeft: "20px" }}>
                  <input
                    placeholder="Tipo"
                    value={ex.type}
                    onChange={e =>
                      setCases(prev =>
                        prev.map((cc, idx) =>
                          idx === i
                            ? {
                                ...cc,
                                steps: cc.steps.map((ss, jj) =>
                                  jj === j
                                    ? {
                                        ...ss,
                                        expect: ss.expect.map((ee, kk) =>
                                          kk === k ? { ...ee, type: e.target.value } : ee
                                        )
                                      }
                                    : ss
                                )
                              }
                            : cc
                        )
                      )
                    }
                  />
                  <input
                    placeholder="Nombre (si aplica)"
                    value={ex.name || ""}
                    onChange={e =>
                      setCases(prev =>
                        prev.map((cc, idx) =>
                          idx === i
                            ? {
                                ...cc,
                                steps: cc.steps.map((ss, jj) =>
                                  jj === j
                                    ? {
                                        ...ss,
                                        expect: ss.expect.map((ee, kk) =>
                                          kk === k ? { ...ee, name: e.target.value } : ee
                                        )
                                      }
                                    : ss
                                )
                              }
                            : cc
                        )
                      )
                    }
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      <button onClick={exportJSON}>⬇️ Exportar JSON</button>

      <pre>
        {JSON.stringify(
          { bot, model, llm: { model, vertexai: true, temperature: 0.0 }, cases },
          null,
          2
        )}
      </pre>
    </div>
  );
}

export default App;
