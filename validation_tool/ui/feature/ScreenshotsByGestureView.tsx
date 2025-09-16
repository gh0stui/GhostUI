'use client'

import { ImageElement } from "@/ui/components/ImageElement";
import { useEffect, useState } from "react";
import { PrettyJSON } from "@/ui/components/PrettyJSON";
import { getJsonData } from "@/app/actions/getJSONData";
import { getXMLData } from "@/app/actions/getXMLData";
import { PrettyXML } from "@/ui/components/PrettyXML";
import { DecisionButton } from "@/ui/components/DecisionButton";
import { DecisionsAPI } from "@/api/decisions";
import { DirectoryAPI } from "@/api/directory";
import { DecisionData } from "@/types/Decision";
import { MultipleCheckBox } from "../components/MultipleCheckBox";
import Image from "next/image";

export const ScreenshotsByGestureView = ({ appName }: { appName: string }) => {
    const [screens, setScreens] = useState([])
    const [currentScreen, setCurrentScreen] = useState('')
    const [gestures, setGestures] = useState([])
    const [currentGesture, setCurrentGesture] = useState('')
    const [numbers, setNumbers] = useState([])
    const [currentNumber, setCurrentNumber] = useState('')
    const [images, setImages] = useState<Array<Image>>([])
    const [jsonData, setJsonData] = useState([])
    const [xmlData, setXmlData] = useState([])
    const [path, setPath] = useState('')

    useEffect(() => {
        DirectoryAPI.getSubfolders(`/${appName}`).then(setScreens)
    }, []);

    useEffect(() => {
        if (appName && currentScreen && currentGesture && currentNumber) {
            setPath(`${appName}/${currentScreen}/${currentGesture}/${currentNumber}`)
        }
    }, [appName, currentScreen, currentGesture, currentNumber]);


    const [decisions, setDecisions] = useState<Array<DecisionData>>([])
    useEffect(() => {
        if (path) DecisionsAPI.getDecisions(path).then(setDecisions)
    }, [path]);

    useEffect(() => {
        if (currentScreen) DirectoryAPI.getSubfolders(`/${appName}/${currentScreen}`).then(setGestures)
    }, [currentScreen]);

    useEffect(() => {
        if (currentGesture) DirectoryAPI.getSubfolders(`/${appName}/${currentScreen}/${currentGesture}`).then(setNumbers)
    }, [currentGesture]);

    useEffect(() => {
        if (screens.length > 0) setCurrentScreen(screens[0])
    }, [screens]);

    useEffect(() => {
        if (gestures.length > 0) setCurrentGesture(gestures[0])
    }, [gestures]);

    useEffect(() => {
        if (numbers.length > 0) setCurrentNumber(numbers[0])
    }, [numbers]);

    useEffect(() => {
        if (currentNumber && currentGesture && currentScreen) {
            DirectoryAPI.getImages(`/${appName}/${currentScreen}/${currentGesture}/${currentNumber}`).then(setImages)
        }
        // getJsonData(`/public/dataset/${appName}/${currentScreen}/${currentGesture}/${currentNumber}`).then(setJsonData)
        // getXMLData(`/public/dataset/${appName}/${currentScreen}/${currentGesture}/${currentNumber}`).then(setXmlData)
    }, [currentNumber, currentGesture, currentScreen]);

    useEffect(() => {
        window.addEventListener("keydown", handleArrowKeys)

        return () => {
            window.removeEventListener("keydown", handleArrowKeys)
        }
    }, [numbers])

    const handleArrowKeys = (event) => {
        if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(event.key)) return
        event.preventDefault() // prevent scrolling

        if (["ArrowRight", "ArrowLeft"].includes(event.key)) {
            setCurrentNumber((prev) => {
                const index = numbers.indexOf(prev)
                if (index === -1) return prev

                return event.key === "ArrowRight"
                    ? numbers[Math.min(index + 1, numbers.length - 1)] // move to next number
                    : numbers[Math.max(index - 1, 0)] // move to previous number
            });
        }

        if (["ArrowDown", "ArrowUp"].includes(event.key)) {
            setCurrentGesture((prev) => {
                const index = gestures.indexOf(prev)
                if (index === -1) return prev

                return event.key === "ArrowDown"
                    ? gestures[Math.min(index + 1, gestures.length - 1)] // move to next gesture
                    : gestures[Math.max(index - 1, 0)] // move to previous gesture
            });
        }
    }

    const toggleJsonVisibility = (filename) => {
        setJsonData((prevData) =>
            prevData.map((item) =>
                item.filename === filename ? { ...item, visible: !item.visible } : item
            )
        );
    };

    const toggleXmlVisibility = (filename) => {
        setXmlData((prevData) =>
            prevData.map((item) =>
                item.filename === filename ? { ...item, visible: !item.visible } : item
            )
        );
    };

    return <div className="flex flex-row min-h-screen bg-gray-50">
        <div className="bg-white shadow-lg w-40 p-3 min-h-screen overflow-y-auto">
            <h3 className="text-slate-800 text-base font-semibold mb-3">Screens</h3>
            <div className="space-y-1">
                {screens.map((screen) => {
                    return <div
                        key={screen}
                        onClick={() => setCurrentScreen(screen)}
                        className={`px-2 py-1.5 rounded-md cursor-pointer transition-all duration-200 text-xs font-medium ${
                            screen == currentScreen 
                                ? 'bg-blue-100 text-blue-800 border-l-3 border-blue-500' 
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                    >
                        {screen}
                    </div>
                })}
            </div>
        </div>

        <div className="bg-white shadow-lg w-40 p-3 border-l border-gray-200 min-h-screen overflow-y-auto">
            <h3 className="text-slate-800 text-base font-semibold mb-3">Gestures</h3>
            <div className="space-y-1">
                {gestures.map((gesture) => {
                    return <div
                        key={gesture}
                        onClick={() => setCurrentGesture(gesture)}
                        className={`px-2 py-1.5 rounded-md cursor-pointer transition-all duration-200 text-xs font-medium ${
                            gesture == currentGesture 
                                ? 'bg-green-100 text-green-800 border-l-3 border-green-500' 
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                    >
                        {gesture}
                    </div>
                })}
            </div>
        </div>

        <div className="flex-1 p-4">
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                <h2 className="text-lg font-semibold text-slate-800 mb-3">Instance Numbers</h2>
                <div className="flex flex-wrap gap-1.5">
                    {numbers.map((number) => {
                        return <button
                            key={number}
                            onClick={() => setCurrentNumber(number)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                                number == currentNumber 
                                    ? 'bg-purple-600 text-white shadow-md' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            #{number}
                        </button>
                    })}
                </div>
            </div>

            {numbers.length > 0 ?
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="text-base font-semibold text-slate-800 mb-4">Screenshot Analysis</h3>
                    
                    <div className="flex gap-4 items-start">
                        {/* Images - all in one row */}
                        <div className="flex flex-row gap-3 flex-wrap flex-1">
                            {images.map((image) => {
                                const currentDecision = image.path.split('/').pop()?.split('.')[0] || ''
                                const daDecision = decisions.find((d) => d.type === 'D/A')
                                const isDuringAfterSelectable = currentGesture == 'long_press' || currentGesture.includes('pinch')
                                const isSelected = isDuringAfterSelectable &&
                                    daDecision && Array.isArray(daDecision.decision) && daDecision.decision.includes(currentDecision)
                                const isSelectable = isDuringAfterSelectable && (image.path.includes('during') || image.path.includes('after'))
                                
                                return (
                                    <div key={image.path} className="flex flex-col items-center">
                                        <div className={`relative rounded-lg overflow-hidden shadow-md transition-all duration-200 ${
                                            isSelected ? 'ring-4 ring-green-400 shadow-green-200' : 
                                            isSelectable ? 'ring-2 ring-blue-300 hover:ring-blue-400 cursor-pointer' : ''
                                        }`}>
                                            <Image
                                                src={image.path}
                                                alt={image.path}
                                                width={200}
                                                height={200}
                                                onClick={() => {
                                                    if (isSelectable) {
                                                        const newDecisions = decisions.filter((d) => d.type !== 'D/A')
                                                        const existingDecision = decisions.find((d) => d.type === 'D/A')
                                                        
                                                        if (existingDecision && Array.isArray(existingDecision.decision)) {
                                                            if (existingDecision.decision.includes(currentDecision)) {
                                                                const newDecision: DecisionData = { 
                                                                    type: 'D/A' as const, 
                                                                    decision: existingDecision.decision.filter((d: string) => d !== currentDecision) 
                                                                }
                                                                setDecisions([...newDecisions, newDecision])
                                                                DecisionsAPI.writeDecisions(path, [...newDecisions, newDecision])
                                                            } else {
                                                                const newDecision: DecisionData = { 
                                                                    type: 'D/A' as const, 
                                                                    decision: [...existingDecision.decision, currentDecision] 
                                                                }
                                                                setDecisions([...newDecisions, newDecision])
                                                                DecisionsAPI.writeDecisions(path, [...newDecisions, newDecision])
                                                            }
                                                        } else {
                                                            const newDecision: DecisionData = { 
                                                                type: 'D/A' as const, 
                                                                decision: [currentDecision] 
                                                            }
                                                            setDecisions([...newDecisions, newDecision])
                                                            DecisionsAPI.writeDecisions(path, [...newDecisions, newDecision])
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
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm min-w-fit flex-shrink-0">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <h4 className="text-base font-semibold text-slate-800">Decision Panel</h4>
                            </div>
                            <div className="space-y-6">
                                <DecisionButton
                                    questionText={`Is the interaction correct?`}
                                    storageKey={`${appName}-${currentScreen}-${currentGesture}-${currentNumber}-correctness`}
                                    type={'isCorrect'}
                                    decisions={decisions}
                                    setDecisions={setDecisions}
                                    path={path}
                                />
                                {!['tap', 'double_tap', 'long_press'].includes(currentGesture) && (
                                    <DecisionButton
                                        questionText={"Is it hidden interaction?"}
                                        storageKey={`${appName}-${currentScreen}-${currentGesture}-${currentNumber}-hidden`}
                                        type={'isHidden'}
                                        decisions={decisions}
                                        setDecisions={setDecisions}
                                        path={path}
                                    />
                                )}
                                <div className="pt-4 border-t border-gray-100">
                                    <MultipleCheckBox
                                        questionText={"UI elements interacted with"}
                                        storageKey={`${appName}-${currentScreen}-${currentGesture}-${currentNumber}-elements`}
                                        type={'elementType'}
                                        decisions={decisions}
                                        setDecisions={setDecisions}
                                        path={path}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>


                    {jsonData.length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-base font-semibold text-slate-800 mb-3">JSON Data</h4>
                            <div className="space-y-3">
                                {jsonData.map(({ filename, data, visible }) => (
                                    <div key={filename} className="bg-slate-50 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <h5 className="text-sm font-medium text-slate-700">{filename}</h5>
                                            <button
                                                onClick={() => toggleJsonVisibility(filename)}
                                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                {visible ? "Hide" : "Show"}
                                            </button>
                                        </div>
                                        {visible && <PrettyJSON data={data} />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {xmlData.length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-base font-semibold text-slate-800 mb-3">XML Data</h4>
                            <div className="space-y-3">
                                {xmlData.map(({ filename, data, visible }) => (
                                    <div key={filename} className="bg-slate-50 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <h5 className="text-sm font-medium text-slate-700">{filename}</h5>
                                            <button
                                                onClick={() => toggleXmlVisibility(filename)}
                                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                {visible ? "Hide" : "Show"}
                                            </button>
                                        </div>
                                        {visible && <PrettyXML xmlString={data} />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                :
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <div className="text-gray-400 text-5xl mb-4">📱</div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">No Screenshots Available</h3>
                        <p className="text-slate-500">Select a screen and gesture to view screenshots</p>
                    </div>
                </div>
            }
        </div>
    </div>
}
