import {TextElement} from "@/ui/components/TextElement";
import {ImageElement} from "@/ui/components/ImageElement";
import {useEffect, useState} from "react";
import {DecisionsAPI } from "@/api/decisions";
import {Decision, DecisionButtonType, DecisionData} from "@/types/Decision";


interface DecisionButtonProps {
    questionText: string
    storageKey: string
    type: DecisionButtonType
    decisions: Array<DecisionData>
    setDecisions: (decisions: Array<DecisionData>) => void
    path: string
}

export const DecisionButton = ({ questionText, storageKey, type, decisions, setDecisions, path }: DecisionButtonProps) => {
    const currentDecision = decisions.find(d => d.type === type)

    const saveDecisions = async (newDecision: Decision) => {
        const newDecisionData: DecisionData = { type, decision: newDecision }

        const updatedDecisions = [...decisions.filter(d => d.type !== newDecisionData.type), newDecisionData]
        setDecisions(updatedDecisions)

        if (path) return DecisionsAPI.writeDecisions(path, updatedDecisions)
    }

    return <div className="w-full" key={storageKey}>
        <label className="block text-sm font-medium text-slate-700 mb-3">
            {questionText}
        </label>

        <div className="flex gap-3">
            <button
                onClick={() => currentDecision?.decision === 'o' ? saveDecisions('none') : saveDecisions('o')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                    currentDecision?.decision === 'o' 
                        ? 'bg-green-50 border-green-300 text-green-800 shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50 hover:text-green-700'
                }`}
            >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    currentDecision?.decision === 'o' 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300'
                }`}>
                    {currentDecision?.decision === 'o' && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>
                <span className="text-sm font-medium">Yes</span>
            </button>

            <button
                onClick={() => currentDecision?.decision === 'x' ? saveDecisions('none') : saveDecisions('x')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                    currentDecision?.decision === 'x' 
                        ? 'bg-red-50 border-red-300 text-red-800 shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700'
                }`}
            >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    currentDecision?.decision === 'x' 
                        ? 'bg-red-500 border-red-500' 
                        : 'border-gray-300'
                }`}>
                    {currentDecision?.decision === 'x' && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>
                <span className="text-sm font-medium">No</span>
            </button>
        </div>
    </div>
}
