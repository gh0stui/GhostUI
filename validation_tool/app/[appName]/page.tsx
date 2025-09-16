'use client'

import {AppContainer} from "@/ui/feature/AppContainer";
import {use} from "react";

export default function AppPage({ params }: { params: Promise<{ appName: string }> }) {
    const { appName } = use(params)

    return <AppContainer appName={appName}/>
}
