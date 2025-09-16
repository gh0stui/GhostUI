import {Image} from "@/types/Image";
import {DecisionData} from "@/types/Decision";

export interface PathObject {
    content: string
    screen: string
    filePaths: Array<string>
}

export type FilePathWithContent = {
    filePath: string,
    content: string,
}

export type FilePathWithImages = {
    filePath: string,
    images: Array<Image>,
}

export type FilePathWithDecisions = {
    filePath: string
    decisions: Array<DecisionData>
}
