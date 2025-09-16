"use server";

import fs from "fs";
import path from "path";

export async function getXMLData(directory: string) {
    const xmlDirectory = path.join(process.cwd(), directory); // Directory where XML files are stored

    try {
        const files = fs.readdirSync(xmlDirectory);
        return files
            .filter(file => file.endsWith(".xml")) // Only get XML files
            .map(file => {
                const filePath = path.join(xmlDirectory, file);
                return {
                    filename: file, // Include filename
                    data: fs.readFileSync(filePath, "utf-8"), // Read XML content as string
                    visible: false,
                };
            });
    } catch (error) {
        console.error("Error reading XML files:", error);
        return [];
    }
}
