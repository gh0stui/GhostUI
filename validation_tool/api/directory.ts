import {FilePathWithContent, PathObject} from "@/types/Path";
import {Image} from "@/types/Image";

const BASE_URL = "http://localhost:3001"

export const DirectoryAPI = (() => {
    const getSubfolders = async (path: string = ""): Promise<string[]> => {
        const url = `${BASE_URL}/list-folders?path=${encodeURIComponent(path)}`
        const res = await fetch(url)

        if (!res.ok) throw new Error("Failed to fetch folders")

        const data = await res.json()
        return data.folders
            .sort((a: string, b: string) => a.localeCompare(b, "en", { numeric: true }))
    }

    const imageOrder: { [key: string]: number } = {
        "before.png": 1,
        "before_annotated.png": 2,
        "before_annotated_with_children.png": 2,
        "during.png": 3,
        "after.png": 4,
    }

    const getImages = async (path: string = ""): Promise<Array<Image>> => {
        const url = `${BASE_URL}/images?path=${encodeURIComponent(path)}`
        const res = await fetch(url)

        if (!res.ok) return []

        const data = await res.json()
        return data.images
            .map((imgPath: string) => ({
                path: `${BASE_URL}/dataset/` + imgPath,
                name: imgPath.split('/').pop(),
            }))
            .filter((item: any, _index: number, arr: any[]) => item.name !== "before_annotated.png" || !arr.some((i: any) => i.name === "before_annotated_with_children.png"))
            .sort((a: any, b: any) => (imageOrder[a.name] || 99) - (imageOrder[b.name] || 99))
    }

    const getPaths = async (path: string = ""): Promise<Array<PathObject>> => {
        const url = `${BASE_URL}/paths?path=${encodeURIComponent(path)}`
        const res = await fetch(url)

        if (!res.ok) return []

        const data = await res.json()
        const paths: Array<FilePathWithContent> = data.files
        return groupPathObjectsByContent(paths)
    }

    const groupPathObjectsByContent = (objects: Array<FilePathWithContent>) => {
        const grouped: { [key: string]: { content: string, screen: string, filePaths: string[] } } = {};

        for (const item of objects) {
            // Extract screen from file path safely
            let screen = 'unknown';
            try {
                const pathParts = item.filePath.split('/').filter(part => part && part.length > 0);
                // Look for screen in path structure: should be 2nd element from the end of path before /gesture/instance/path.txt
                if (pathParts.length >= 4 && pathParts[pathParts.length - 1] === 'path.txt') {
                    screen = pathParts[pathParts.length - 4]; // -1: path.txt, -2: instance, -3: gesture, -4: screen
                }
            } catch (error) {
                console.error('Error extracting screen from path:', item.filePath, error);
                screen = 'unknown';
            }
            
            // Create a unique key combining content and screen
            const groupKey = `${item.content}|||${screen}`;
            
            if (!grouped[groupKey]) {
                grouped[groupKey] = {
                    content: item.content,
                    screen: screen,
                    filePaths: []
                };
            }
            grouped[groupKey].filePaths.push(item.filePath);
        }

        const result = Object.values(grouped);
        return result;
    }



    return Object.freeze({
        getSubfolders,
        getImages,
        getPaths,
        groupPathObjectsByContent,
    })
})()
