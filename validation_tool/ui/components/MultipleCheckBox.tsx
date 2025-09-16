import { useEffect, useState } from "react";
import { TextElement } from "@/ui/components/TextElement";
import { DecisionsAPI } from "@/api/decisions";
import { DecisionButtonType, DecisionData } from "@/types/Decision";

// 숨겨진 UI 요소로 체크할 옵션들
const HIDDEN_UI_OPTIONS = [
  { label: "Border", value: "border" },
  { label: "Text", value: "text" },
  { label: "Icon", value: "icon" },
  { label: "Media (e.g., image, video, map)", value: "imageOrVideo" },
  { label: "Whitespace", value: "emptySpace" },
];

interface MultipleCheckBoxProps {
  questionText: string;
  storageKey: string;
  type: DecisionButtonType;
  decisions: DecisionData[];
  setDecisions: (decisions: DecisionData[]) => void;
  path: string;
}

export const MultipleCheckBox = ({
  questionText,
  storageKey,
  type,
  decisions,
  setDecisions,
  path
}: MultipleCheckBoxProps) => {
  const currentDecision = decisions.find((d) => d.type === type);

  const selectedOptions = (currentDecision?.decision?.selectedOptions || []);

  const [othersText, setOthersText] = useState(
    currentDecision?.decision?.othersText || ""
  );
  useEffect(() => {
    setOthersText(currentDecision?.decision?.othersText || "");
  }, [currentDecision]);
  const toggleOption = (optionValue: string) => {
    let newSelectedOptions = [...selectedOptions];

    if (newSelectedOptions.includes(optionValue)) {
      newSelectedOptions = newSelectedOptions.filter((opt) => opt !== optionValue);
    }
    else {
      newSelectedOptions.push(optionValue);
    }

    const updatedDecisions = decisions.filter((d) => d.type !== type);
    if ((othersText && othersText.trim() !== "") || newSelectedOptions.length !== 0) {
      updatedDecisions.push({
        type: type,
        decision: {
          selectedOptions: newSelectedOptions,
          othersText,
        },
      });
    }


    setDecisions(updatedDecisions);
    if (path) {
      DecisionsAPI.writeDecisions(path, updatedDecisions);
    }
  };

  const handleOthersTextChange = (text: string) => {
    setOthersText(text);

    const updatedDecisions = decisions.filter((d) => d.type !== type);
    if ((text && text.trim() !== "") || selectedOptions.length !== 0) {
      updatedDecisions.push({
        type,
        decision: {
          selectedOptions,
          othersText: text,
        },
      });
    }

    setDecisions(updatedDecisions);
    if (path) {
      DecisionsAPI.writeDecisions(path, updatedDecisions);
    }
  };

  return (
    <div className="w-full" key={storageKey}>
      <label className="block text-sm font-medium text-slate-700 mb-3">
        {questionText}
      </label>

      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        {HIDDEN_UI_OPTIONS.map((option) => {
          const isChecked = selectedOptions.includes(option.value);
          return (
            <div key={option.value} className="flex items-center">
              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleOption(option.value)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    isChecked 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'bg-white border-gray-300 group-hover:border-blue-400'
                  }`}>
                    {isChecked && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-3 text-sm text-slate-700 group-hover:text-slate-900">{option.label}</span>
              </label>
            </div>
          );
        })}
        
        <div className="pt-3 border-t border-gray-100">
          <input
            type="text"
            value={othersText}
            onChange={(e) => handleOthersTextChange(e.target.value)}
            placeholder="Other elements (specify)"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>
    </div>
  );
};
