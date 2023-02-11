import { useState, useEffect, useCallback } from "react";

const useHashString = (str: string) => {
  const [hash, setHash] = useState<ArrayBuffer | null>(null);

  const hashString = useCallback(async (str: string) => {
    if (!window.crypto) {
      console.error("Web Cryptography API is not supported in this browser");
      return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(str);

    const hash = await window.crypto.subtle.digest("SHA-256", data);

    setHash(new Uint8Array(hash));
  }, []);

  useEffect(() => {
    hashString(str);
  }, [hashString, str]);

  return hash;
};

export default useHashString;
