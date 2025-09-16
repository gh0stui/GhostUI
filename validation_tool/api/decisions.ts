import {DecisionData} from "@/types/Decision";
import {FilePathWithContent, PathObject} from "@/types/Path";

const BASE_URL = "http://localhost:3001"

export const DecisionsAPI = (() => {
    const getDecisions = async (path: string): Promise<Array<DecisionData>> => {
        const response = await fetch(`http://localhost:3001/dataset/${path}/decision.txt`, {
            method: "GET",
        });

        if (response.ok) {
            const responseText = await response.text();
            return JSON.parse(responseText);
        } else {
            return []
        }
    }

    const writeDecisions = async (path: string, updatedDecisions: Array<DecisionData>) => {
        const decisionsJSON = JSON.stringify(updatedDecisions, null, 2)

        const response = await fetch(`http://localhost:3001/dataset/${path}/decision.txt`, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain",
            },
            body: decisionsJSON,
        });

        return await response.json()
    }

    const getAllDecisionFiles = async (path: string = "") => {
        const url = `${BASE_URL}/decisions?path=${encodeURIComponent(path)}`
        const res = await fetch(url)

        if (!res.ok) return []

        const data = await res.json()
        return data.files
    }

    return Object.freeze({
        getDecisions,
        writeDecisions,
        getAllDecisionFiles,
    })
})()
