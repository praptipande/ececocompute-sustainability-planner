import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, type Scenario } from '../lib/api';
import { useAuth } from './AuthContext';

type ScenarioContextValue = {
  scenarios: Scenario[];
  activeScenario: Scenario | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (input: Scenario['input']) => Promise<Scenario>;
  update: (id: string, input: Scenario['input']) => Promise<Scenario>;
  remove: (id: string) => Promise<void>;
  setActive: (scenario: Scenario | null) => void;
};

const ScenarioContext = createContext<ScenarioContextValue | null>(null);

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const result = await api.scenarios();
      setScenarios(result.scenarios);
      setActiveScenario((current) =>
        current
          ? result.scenarios.find((scenario) => scenario.id === current.id) ?? null
          : result.scenarios[0] ?? null,
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load saved scenarios.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setScenarios([]);
    setActiveScenario(null);
    if (user) void refresh();
  }, [user]);

  const value = useMemo<ScenarioContextValue>(() => ({
    scenarios,
    activeScenario,
    loading,
    error,
    refresh,
    async create(input) {
      const result = await api.createScenario(input);
      setScenarios((current) => [result.scenario, ...current]);
      setActiveScenario(result.scenario);
      return result.scenario;
    },
    async update(id, input) {
      const result = await api.updateScenario(id, input);
      setScenarios((current) => current.map((scenario) => scenario.id === id ? result.scenario : scenario));
      setActiveScenario(result.scenario);
      return result.scenario;
    },
    async remove(id) {
      await api.deleteScenario(id);
      setScenarios((current) => current.filter((scenario) => scenario.id !== id));
      setActiveScenario((current) => current?.id === id ? null : current);
    },
    setActive: setActiveScenario,
  }), [activeScenario, error, loading, scenarios]);

  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
}

export function useScenarios(): ScenarioContextValue {
  const context = useContext(ScenarioContext);
  if (!context) throw new Error('useScenarios must be used inside ScenarioProvider');
  return context;
}
