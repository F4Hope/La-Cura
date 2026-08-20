"use client";

import { createContext, useContext, useState } from "react";


export type ResidentWorkspaceMode =
  | "expanded"
  | "standard"
  | "compact";


type ContextType = {
  mode: ResidentWorkspaceMode;
  setMode: (
    mode: ResidentWorkspaceMode
  ) => void;
};


const ResidentWorkspaceContext =
  createContext<ContextType | null>(null);


export function ResidentWorkspaceProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [mode, setMode] =
    useState<ResidentWorkspaceMode>(
      "standard"
    );


  return (
    <ResidentWorkspaceContext.Provider
      value={{
        mode,
        setMode,
      }}
    >
      {children}
    </ResidentWorkspaceContext.Provider>
  );
}



export function useResidentWorkspace() {

  const context =
    useContext(
      ResidentWorkspaceContext
    );


  if (!context) {
    throw new Error(
      "useResidentWorkspace must be used inside ResidentWorkspaceProvider"
    );
  }


  return context;
}
