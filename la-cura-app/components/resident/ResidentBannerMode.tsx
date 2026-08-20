"use client";

import {
  useResidentWorkspace,
} from "./ResidentWorkspaceMode";


export default function ResidentBannerMode({
  children,
}: {
  children: React.ReactNode;
}) {

  const {
    mode,
  } = useResidentWorkspace();


  return (
    <div
      className="resident-banner-mode"
      data-mode={mode}
    >
      {children}
    </div>
  );
}
