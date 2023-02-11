import { useState, useEffect } from "react";

const useWebAuthnSupport = (): boolean => {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (window.PublicKeyCredential) {
      setSupported(true);
    }
  }, []);

  return supported;
};

export default useWebAuthnSupport;
