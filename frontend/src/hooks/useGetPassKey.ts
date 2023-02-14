import { useState, useEffect } from "react";

const useGetPassKey = (
  challenge: string | Uint8Array,
  userId: string | Uint8Array,
  userName?: string,
  displayName?: string
) => {
  const [credential, setCredential] = useState<Credential | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const options: any = {
      publicKey: {
        rp: {
          name: document.referrer,
        },
        user: {
          id:
            typeof userId === "string"
              ? new TextEncoder().encode(userId)
              : userId,
          name: userName || "User",
          displayName: displayName || "Display Name",
        },

        pubKeyCredParams: [{ type: "public-key", alg: -7 }],
        challenge:
          typeof challenge === "string"
            ? new TextEncoder().encode(challenge)
            : challenge,
        authenticatorSelection: {
          authenticatorAttachment: "platform",
        },
        attestation: "direct",
      },
    };

    const createCredential = async () => {
      try {
        const credential = await navigator.credentials.create(options);
        setCredential(credential);
      } catch (error: any) {
        setError(error);
      }
    };
    createCredential();
  }, [challenge, displayName, userId, userName]);

  return { credential, error };
};

export default useGetPassKey;
