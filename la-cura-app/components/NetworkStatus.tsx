"use client";

import { useEffect, useState } from "react";

export default function NetworkStatus() {

  const [online, setOnline] = useState(true);

  useEffect(() => {

    setOnline(navigator.onLine);

    const onlineHandler = () => setOnline(true);
    const offlineHandler = () => setOnline(false);

    window.addEventListener(
      "online",
      onlineHandler
    );

    window.addEventListener(
      "offline",
      offlineHandler
    );


    return () => {

      window.removeEventListener(
        "online",
        onlineHandler
      );

      window.removeEventListener(
        "offline",
        offlineHandler
      );

    };

  }, []);


  return (

    <div
      className={`fixed bottom-4 right-4 px-4 py-2 rounded-full text-white text-sm shadow-lg ${
        online
          ? "bg-green-700"
          : "bg-red-600"
      }`}
    >

      {online
        ? "🟢 Online"
        : "🔴 Offline Mode"}

    </div>

  );

}