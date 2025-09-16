import { useCallback, useEffect, useState } from "react";
import { DecisionsAPI } from "@/api/decisions";
import { Gesture, getGestureFromFullFilePath } from "@/types/Gesture";
import { Decision, DecisionData } from "@/types/Decision";
import { DirectoryAPI } from "@/api/directory";
import { Image } from "@/types/Image";
import { ImageElement } from "@/ui/components/ImageElement";
import { DecisionButton } from "@/ui/components/DecisionButton";
import { MultipleCheckBox } from "../components/MultipleCheckBox";

interface Result {
    path: string
    gesture: Gesture
    decisions: Array<DecisionData>
}

export const ResultsContainer = () => {
    const [results, setResults] = useState<Array<Result>>([])
    const [resultsByApp, setResultsByApp] = useState<Array<Result>>([])
    const [currentResult, setCurrentResult] = useState<Result>()
    const [images, setImages] = useState<Array<Image>>([])
    const [decisions, setDecisions] = useState<Array<DecisionData>>([])

    const [appNames, setAppNames] = useState([]);
    const [currentApp, setCurrentApp] = useState<string>()
    const [allDecisions, setAllDecisions] = useState<Array<Result>>([])
    console.log(results, resultsByApp, currentResult, images, decisions)

    // Calculate total hidden interactions count
    const totalHiddenInteractionsCount = results.length;

    useEffect(() => {
        DirectoryAPI.getSubfolders('').then(setAppNames)
    }, []);

    useEffect(() => {
        if (appNames.length > 0) {
            setCurrentApp(appNames[0])
        }
    }, [appNames]);

    useEffect(() => {
        DecisionsAPI.getAllDecisionFiles('').then((response) => {
            const allDecisionsData = response
                .map((item) => ({
                    path: item.filePath,
                    gesture: getGestureFromFullFilePath(item.filePath),
                    decisions: JSON.parse(item.content)
                }))
            
            setAllDecisions(allDecisionsData)
            
            const res = allDecisionsData
                .filter(({ gesture, decisions }) => Decision.getDecisionResultByGesture(gesture, decisions))
            setResults(res)
        })
    }, []);

    // initial run
    useEffect(() => {
        if (results.length > 0) {
            setResultsByApp(results.filter(({ path }) => getAppNameFromPath(path) === getAppNameFromPath(results[0].path)))
        }
    }, [results])

    // every time new app is clicked
    useEffect(() => {
        setResultsByApp(results.filter(({ path }) => getAppNameFromPath(path) === currentApp))
    }, [currentApp])

    useEffect(() => {
        if (resultsByApp.length > 0) {
            setCurrentResult(resultsByApp[0])
            fetchItem(resultsByApp[0].path)
        } else {
            setCurrentResult(undefined)
            setImages([])
        }
    }, [resultsByApp]);


    useEffect(() => {
        window.addEventListener("keydown", handleArrowKeys)

        return () => {
            window.removeEventListener("keydown", handleArrowKeys)
        }
    }, [resultsByApp, currentResult])

    const handleArrowKeys = (event) => {
        if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(event.key)) return
        event.preventDefault() // prevent scrolling

        if (["ArrowDown", "ArrowUp"].includes(event.key)) {
            const currentIndexResult = resultsByApp.indexOf(currentResult)
            if (currentIndexResult === -1) return
            const nextIndex = event.key === "ArrowDown" ? currentIndexResult + 1 : currentIndexResult - 1
            if (nextIndex < 0 || nextIndex >= resultsByApp.length) return // out of bounds
            setCurrentResult(resultsByApp[nextIndex])
            fetchItem(resultsByApp[nextIndex].path)
        }
    }

    const fetchItem = useCallback((path: string) => {
        const parentDir = path.replace(/\/decision\.txt$/, "");
        DirectoryAPI.getImages(parentDir).then(setImages)
        DecisionsAPI.getDecisions(parentDir).then(setDecisions)
    }, [])

    return <div className="flex flex-row min-h-screen bg-gray-50">
        <div className="bg-slate-800 min-h-screen w-64 px-6 py-6 shadow-lg">
            <h2 className="text-white text-lg font-semibold mb-4">Apps</h2>
            <div className="bg-slate-700 rounded-lg p-4 mb-6">
                <div className="text-sm text-slate-300 mb-1">Total Hidden Interactions</div>
                <div className="text-2xl font-bold text-white">{totalHiddenInteractionsCount}</div>
            </div>
            <div className="space-y-2">
                {appNames.map((appName) => {
                    return <div
                        key={appName}
                        onClick={() => setCurrentApp(appName)}
                        className={`px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-slate-700 ${
                            appName === currentApp 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'text-slate-300 hover:text-white'
                        }`}
                    >
                        <span className="text-sm font-medium">{appName}</span>
                    </div>
                })}
            </div>
        </div>

        {resultsByApp.length > 0 ?
            <div className="bg-white shadow-lg rounded-xl m-6 p-4 w-72 max-h-[90vh] overflow-y-auto">
                <h3 className="text-slate-700 text-base font-semibold mb-4">Results ({resultsByApp.length})</h3>
                <div className="space-y-2">
                    {resultsByApp.map((res, index) => {
                        return <div
                            key={`${res.path}+${index}`}
                            onClick={() => {
                                fetchItem(res.path)
                                setCurrentResult(res)
                            }}
                            className={`px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                                res === currentResult 
                                    ? 'bg-blue-50 border-blue-200 text-blue-800 shadow-sm' 
                                    : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100 hover:border-gray-200'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">#{index + 1}</span>
                                <span className="text-xs text-gray-400 uppercase tracking-wide">{res.gesture}</span>
                            </div>
                        </div>
                    })}
                </div>
            </div>
            :
            <div className="flex flex-col items-center justify-center w-72 m-6">
                <div className="bg-white shadow-lg rounded-xl p-8 text-center">
                    <div className="text-gray-400 text-4xl mb-4">📊</div>
                    <p className="text-slate-600 text-base">No results found</p>
                    <p className="text-slate-400 text-sm mt-2">Select an app to view results</p>
                </div>
            </div>
        }

        <div className="flex-1 px-8 py-6">
            {currentResult && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Current Result</h2>
                    <p className="text-sm text-slate-600 break-words max-w-full">{currentResult.path}</p>
                    <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {currentResult.gesture}
                        </span>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Screenshot Analysis</h3>
                
                <div className="flex gap-6 items-start">
                    {/* Images - all in one row */}
                    <div className="flex flex-row gap-4 flex-wrap flex-1">
                        {images.map((image) => {
                            const currentDecision = image.path.split('/').pop()?.split('.')[0] || ''
                            const daDecision = decisions.find((d) => d.type === 'D/A')
                            const isDuringAfterSelectable = currentResult?.gesture == 'long_press' || currentResult?.gesture.includes('pinch')
                            const isSelected = isDuringAfterSelectable &&
                                daDecision && Array.isArray(daDecision.decision) && daDecision.decision.includes(currentDecision)
                            const isSelectable = isDuringAfterSelectable && (image.path.includes('during') || image.path.includes('after'))
                            
                            return (
                                <div key={image.path} className="flex flex-col items-center">
                                    <div className={`relative rounded-lg overflow-hidden shadow-md transition-all duration-200 ${
                                        isSelected ? 'ring-4 ring-green-400 shadow-green-200' : 
                                        isSelectable ? 'ring-2 ring-blue-300 hover:ring-blue-400 cursor-pointer' : ''
                                    }`}>
                                        <ImageElement
                                            src={image.path}
                                            width={200}
                                            height={200}
                                            onClick={() => {
                                                if (isSelectable && currentResult) {
                                                    const newDecisions = decisions.filter((d) => d.type !== 'D/A')
                                                    const existingDecision = decisions.find((d) => d.type === 'D/A')
                                                    const parentDir = currentResult.path.replace(/\/decision\.txt$/, "");
                                                    
                                                    if (existingDecision && Array.isArray(existingDecision.decision)) {
                                                        if (existingDecision.decision.includes(currentDecision)) {
                                                            const newDecision: DecisionData = { 
                                                                type: 'D/A' as const, 
                                                                decision: existingDecision.decision.filter((d: string) => d !== currentDecision) 
                                                            }
                                                            setDecisions([...newDecisions, newDecision])
                                                            DecisionsAPI.writeDecisions(parentDir, [...newDecisions, newDecision])
                                                        } else {
                                                            const newDecision: DecisionData = { 
                                                                type: 'D/A' as const, 
                                                                decision: [...existingDecision.decision, currentDecision] 
                                                            }
                                                            setDecisions([...newDecisions, newDecision])
                                                            DecisionsAPI.writeDecisions(parentDir, [...newDecisions, newDecision])
                                                        }
                                                    } else {
                                                        const newDecision: DecisionData = { 
                                                            type: 'D/A' as const, 
                                                            decision: [currentDecision] 
                                                        }
                                                        setDecisions([...newDecisions, newDecision])
                                                        DecisionsAPI.writeDecisions(parentDir, [...newDecisions, newDecision])
                                                    }
                                                }
                                            }}
                                        />
                                        {isSelectable && (
                                            <div className={`absolute top-2 right-2 rounded p-1 ${
                                                isSelected 
                                                    ? 'bg-green-500 text-white' 
                                                    : 'bg-gray-400 text-white'
                                            }`}>
                                                {isSelected ? (
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
                                                    </svg>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm font-medium text-slate-700 mt-3 text-center">{image.name}</p>
                                </div>
                            )
                        })}
                    </div>

                    {/* Decision Panel - on the right side */}
                    {currentResult && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm min-w-fit flex-shrink-0">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <h4 className="text-base font-semibold text-slate-800">Decision Panel</h4>
                            </div>
                            <div className="space-y-6">
                                <DecisionButton
                                    questionText={`Is the interaction correct?`}
                                    storageKey={`${currentResult?.path}-correctness`}
                                    type={'isCorrect'}
                                    decisions={decisions}
                                    setDecisions={setDecisions}
                                    path={currentResult?.path ?? ''}
                                />
                                {!['tap', 'double_tap', 'long_press'].includes(currentResult.gesture) && (
                                    <DecisionButton
                                        questionText={"Is it hidden interaction?"}
                                        storageKey={`${currentResult?.path}-hidden`}
                                        type={'isHidden'}
                                        decisions={decisions}
                                        setDecisions={setDecisions}
                                        path={currentResult?.path ?? ''}
                                    />
                                )}
                                <div className="pt-4 border-t border-gray-100">
                                    <MultipleCheckBox
                                        questionText={"UI elements interacted with"}
                                        storageKey={`${currentResult?.path}-elements`}
                                        type={'elementType'}
                                        decisions={decisions}
                                        setDecisions={setDecisions}
                                        path={currentResult?.path ?? ''}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
}

const getAppNameFromPath = (path: string) => {
    return path.split('/')[0]
}
