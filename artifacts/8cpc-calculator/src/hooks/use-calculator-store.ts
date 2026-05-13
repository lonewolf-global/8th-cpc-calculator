import { useState, useEffect } from "react";
import { CalculatorInputs, CityCategory } from "@/lib/calculator";

const STORAGE_KEY = "8cpc_calculator_inputs";

const defaultInputs: CalculatorInputs = {
  basicPay: 44900,
  payLevel: 7,
  fitmentFactor: 2.57,
  cityCategory: "X",
  currentDA: 60,
};

export function useCalculatorStore() {
  const [inputs, setInputs] = useState<CalculatorInputs>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse stored inputs", e);
    }
    return defaultInputs;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  }, [inputs]);

  const updateInput = <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return { inputs, updateInput, setInputs };
}
