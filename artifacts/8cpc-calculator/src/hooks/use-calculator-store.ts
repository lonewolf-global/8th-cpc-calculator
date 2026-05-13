import { useState, useEffect } from "react";
import { CalculatorInputs, CityCategory, TACityType, PensionType, TaxRegime } from "@/lib/calculator";

const STORAGE_KEY = "8cpc_calculator_inputs_v2";

const defaultInputs: CalculatorInputs = {
  payLevel: "7",
  basicPay: 44900,
  cityCategory: "X",
  hraPercent8CPC: 24,
  currentDA: 60,
  taCity: "higher_tpta",
  fitmentFactor: 2.57,
  pensionType: "nps",
  isCGHSBeneficiary: true,
  taxRegime: "new",
};

export function useCalculatorStore() {
  const [inputs, setInputs] = useState<CalculatorInputs>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...defaultInputs, ...JSON.parse(stored) };
    } catch (_) {}
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
