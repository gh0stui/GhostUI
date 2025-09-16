'use client'

import {Sidebar} from "@/ui/components/Sidebar";

export const HomeContainer = () => {
    return <div className="flex flex-col w-full h-full">
        <div className="flex flex-row h-full w-full gap-[30px]">
            <Sidebar/>
        </div>
    </div>
}

