import { Gesture } from "@/types/Gesture";

export type Decision = 'x' | 'o' | 'none'
export type DecisionButtonType = 'isHidden' | 'isCorrect' | 'elementType' | 'D/A'

export type elementType = {
    selectedOptions: Array<string>
    othersText?: string
}
export type DecisionData = {
    type: DecisionButtonType
    decision: elementType | Decision | string[]
}

export const Decision = (() => {
    const getDecisionResultByGesture = (gesture: Gesture, decisions: Array<DecisionData>) => {
        switch (gesture) {
            case "tap":
                return decisions.find((d) => d.type === 'isCorrect')?.decision === 'o' && (() => {
                    const elementDecision = decisions.find((d) => d.type === 'elementType')?.decision;
                    return elementDecision 
                        && typeof elementDecision === 'object' 
                        && 'selectedOptions' in elementDecision 
                        && elementDecision.selectedOptions.length === 1 
                        && (elementDecision.selectedOptions[0] === 'imageOrVideo' 
                            || elementDecision.selectedOptions[0] === 'emptySpace');
                })();

            case "double_tap":
            case "long_press":
                return decisions.find((d) => d.type === 'isCorrect')?.decision === 'o';

            default:
                return decisions.find((d) => d.type === 'isCorrect')?.decision === 'o' 
                    && decisions.find((d) => d.type === 'isHidden')?.decision === 'o';
        }
    };

    return Object.freeze({
        getDecisionResultByGesture,
    });
})();

