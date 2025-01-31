import type { Metadata } from "next/types";

import React from 'react'
import SettingsView from "./view";

export const metadata: Metadata = {
    title: "Settings",
};

const SettingsPage = () => {
    return (
        <>
            <SettingsView />
        </>
    )
}

export default SettingsPage