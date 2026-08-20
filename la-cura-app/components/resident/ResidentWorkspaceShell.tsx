"use client";

import type { ReactNode } from "react";

import {
  ResidentWorkspaceProvider,
  useResidentWorkspace,
} from "./ResidentWorkspaceMode";


function ResidentWorkspaceInner({
  children,
}: {
  children: ReactNode;
}) {
  const { mode } =
    useResidentWorkspace();

  return (
    <div
      data-resident-mode={mode}
      data-mode={mode}
      className="resident-workspace-shell"
    >
      {children}
    </div>
  );
}


export default function ResidentWorkspaceShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ResidentWorkspaceProvider>
      <ResidentWorkspaceInner>
        {children}
      </ResidentWorkspaceInner>
    </ResidentWorkspaceProvider>
  );
}
