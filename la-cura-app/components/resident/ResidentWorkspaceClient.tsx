"use client";

import {
  useResidentWorkspace,
} from "./ResidentWorkspaceMode";


export default function ResidentWorkspaceClient({
  children,
}: {
  children: React.ReactNode;
}) {

  const {
    mode,
  } = useResidentWorkspace();


  return (
    <div data-resident-mode={mode}>
      {children}
    </div>
  );
}
