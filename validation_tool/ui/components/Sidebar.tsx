import {TextElement} from "@/ui/components/TextElement";
import {useEffect, useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {DirectoryAPI} from "@/api/directory";

export const Sidebar = () => {
    const router = useRouter()
    const pathname = usePathname()
    const params = useSearchParams().toString()
    const queryString = params ? `?${params}` : ''

    const [folders, setFolders] = useState([]);

    useEffect(() => {
        DirectoryAPI.getSubfolders('').then(setFolders)
    }, []);

    return <div className="flex flex-col items-start px-2 py-3 bg-gray-100 h-screen border-r border-gray-200 shadow-sm overflow-y-auto">
        {folders.map((folder) => {
            const isActive = `/${folder}` === pathname
            return <div
                key={folder}
                onClick={() => router.push(`/${folder}${queryString}`)}
                className={`w-full mb-1 px-2 py-1 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-200 ${
                    isActive ? 'bg-blue-100 border-l-4 border-blue-500' : 'hover:shadow-sm'
                }`}
            >
                <TextElement
                    fontSize="base"
                    color={isActive ? '#3b82f6' : '#374151'}
                    className={`text-left text-sm transition-colors duration-200 ${
                        isActive ? 'font-semibold' : 'font-medium'
                    }`}
                >{folder}</TextElement>
            </div>
        })}
    </div>
}
