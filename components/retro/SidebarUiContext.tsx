"use client";

import { createContext, useContext, type ReactNode } from "react";

type SidebarUiValue = {
  collapsed: boolean;
};

const SidebarUiContext = createContext<SidebarUiValue>({ collapsed: false });

export function SidebarUiProvider({ collapsed, children }: { collapsed: boolean; children: ReactNode }) {
  return <SidebarUiContext.Provider value={{ collapsed }}>{children}</SidebarUiContext.Provider>;
}

export function useSidebarUi() {
  return useContext(SidebarUiContext);
}
