"use server";

import fs from "fs";
import path from "path";

export async function getJsonData(pathString: string) {
    const dataDirectory = path.join(process.cwd(), pathString); // JSON files directory

    try {
        const files = fs.readdirSync(dataDirectory);
        return files
            .filter(file => file.endsWith(".json")) // Only get JSON files
            .map(file => {
                const filePath = path.join(dataDirectory, file);
                return {
                    filename: file, // Include filename
                    data: JSON.parse(fs.readFileSync(filePath, "utf-8")), // Parse JSON content
                    visible: false,
                };
            });
    } catch (error) {
        console.error("Error reading JSON files:", error);
        return [];
    }
}
