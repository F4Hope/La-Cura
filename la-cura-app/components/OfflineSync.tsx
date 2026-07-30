"use client";

import { useEffect } from "react";
import { syncOfflineData } from "@/lib/sync";

export default function OfflineSync() {

  useEffect(()=>{

    syncOfflineData();

    window.addEventListener(
      "online",
      syncOfflineData
    );


    return ()=>{

      window.removeEventListener(
        "online",
        syncOfflineData
      );

    };

  },[]);


  return null;

}