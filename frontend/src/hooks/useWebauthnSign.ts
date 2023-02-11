import React, { useState, useEffect } from "react";

interface WebAuthnOptions {
  rp?: {
    name: string;
  };
  user?: {
    id: number;
    name: string;
    displayName: string;
  };
}

const useWebAuthn = (
  challenge: string,
  publicKey?: string,
  options?: WebAuthnOptions
) => {
  const [signedChallenge, setSignedChallenge] = useState<ArrayBuffer | null>(
    null
  );
  const [publicKeyState, setPublicKeyState] = useState<ArrayBuffer | null>(
    publicKey ? new TextEncoder().encode(publicKey).buffer : null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  useEffect(() => {
    const encodedChallenge = new TextEncoder().encode(challenge);
    const publicKeyOptions: PublicKeyCredentialCreationOptions = {
      challenge: encodedChallenge.buffer,
      rp: options?.rp ?? { name: "Your Website Name" },
      user: options?.user
        ? {
            id: new Uint8Array(
              options.user.id.toString().split("").map(Number)
            ),
            name: options.user.name,
            displayName: options.user.displayName,
          }
        : {
            id: new Uint8Array(16),
            name: "User Name",
            displayName: "User Display Name",
          },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }],
      timeout: 60000,
      attestation: "direct",
    };
    const handleSigningError = (error: Error) => {
      setErrorMessage(error.message);
    };
    if (publicKey) {
      const encodedPublicKey = new TextEncoder().encode(publicKey).buffer;
      setPublicKeyState(encodedPublicKey);
      const algorithm = { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" };
      window.crypto.subtle
        .importKey("spki", encodedPublicKey, algorithm, true, ["sign"])
        .then((importedKey: CryptoKey) => {
          window.crypto.subtle
            .sign(algorithm, importedKey, encodedChallenge.buffer)
            .then((signedData: ArrayBuffer) => {
              setSignedChallenge(signedData);
            })
            .catch(handleSigningError);
        })
        .catch(handleSigningError);
    } else {
      navigator.credentials
        .create({ publicKey: publicKeyOptions })
        .then((credential) => {
          setPublicKeyState((credential as any).response.clientDataJSON);
          const privateKey = (credential as any).privateKey;
          const algorithm = { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" };
          window.crypto.subtle
            .sign(algorithm, privateKey, encodedChallenge.buffer)
            .then((signedData: ArrayBuffer) => {
              setSignedChallenge(signedData);
            })
            .catch(handleSigningError);
        })
        .catch(handleSigningError);
    }
  }, [challenge, publicKey, options]);
  return {
    signedChallenge: signedChallenge
      ? new TextDecoder().decode(signedChallenge)
      : null,
    publicKey: publicKeyState ? new TextDecoder().decode(publicKeyState) : null,
    errorMessage,
  };
};

// package main

// import (
// 	"crypto"
// 	"crypto/rsa"
// 	"crypto/sha256"
// 	"crypto/x509"
// 	"encoding/base64"
// 	"encoding/pem"
// 	"github.com/labstack/echo"
// 	"net/http"
// )

// func VerifyHandler(c echo.Context) error {
// 	publicKey := c.QueryParam("publicKey")
// 	signedChallenge := c.QueryParam("signedChallenge")

// 	block, _ := pem.Decode([]byte(publicKey))
// 	if block == nil {
// 		return c.String(http.StatusBadRequest, "Failed to decode public key")
// 	}
// 	pub, err := x509.ParsePKIXPublicKey(block.Bytes)
// 	if err != nil {
// 		return c.String(http.StatusBadRequest, "Failed to parse public key")
// 	}
// 	rsaPub, ok := pub.(*rsa.PublicKey)
// 	if !ok {
// 		return c.String(http.StatusBadRequest, "Invalid public key format")
// 	}

// 	signedChallengeBytes, err := base64.StdEncoding.DecodeString(signedChallenge)
// 	if err != nil {
// 		return c.String(http.StatusBadRequest, "Failed to decode signed challenge")
// 	}

// 	err = rsa.VerifyPKCS1v15(rsaPub, crypto.SHA256, sha256.Sum256([]byte("challenge")), signedChallengeBytes)
// 	if err != nil {
// 		return c.String(http.StatusBadRequest, "Failed to verify signed challenge")
// 	}

// 	return c.String(http.StatusOK, "Signed challenge verified successfully")
// }

// import React, { useState, useEffect } from "react";

// interface WebAuthnOptions {
//   rp?: {
//     name: string;
//   };
//   user?: {
//     id: Uint8Array;
//     name: string;
//     displayName: string;
//   };
// }

// const useWebAuthn = (
//   challenge: string,
//   publicKey?: string,
//   options?: WebAuthnOptions
// ) => {
//   const [signedChallenge, setSignedChallenge] = useState<ArrayBuffer | null>(
//     null
//   );
//   const [publicKeyState, setPublicKeyState] = useState<ArrayBuffer | null>(
//     publicKey ? new TextEncoder().encode(publicKey).buffer : null
//   );
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);

//   useEffect(() => {
//     const encodedChallenge = new TextEncoder().encode(challenge);

//     const publicKeyOptions: PublicKeyCredentialCreationOptions = {
//       challenge: encodedChallenge.buffer,
//       rp: options?.rp ?? {
//         name: "Your Website Name",
//       },
//       user: options?.user ?? {
//         id: new Uint8Array(16),
//         name: "User Name",
//         displayName: "User Display Name",
//       },
//       pubKeyCredParams: [
//         {
//           type: "public-key",
//           alg: -7, // ES256
//         },
//       ],
//       timeout: 60000,
//       attestation: "direct",
//     };

//     const handleSigningError = (error: Error) => {
//       setErrorMessage(error.message);
//     };

//     if (publicKey) {
//       const encodedPublicKey = new TextEncoder().encode(publicKey).buffer;
//       setPublicKeyState(encodedPublicKey);

//       const algorithm = {
//         name: "RSASSA-PKCS1-v1_5",
//         hash: "SHA-256",
//       };

//       window.crypto.subtle
//         .importKey("spki", encodedPublicKey, algorithm, true, ["sign"])
//         .then((importedKey: CryptoKey) => {
//           window.crypto.subtle
//             .sign(algorithm, importedKey, encodedChallenge.buffer)
//             .then((signedData: ArrayBuffer) => {
//               setSignedChallenge(signedData);
//             })
//             .catch(handleSigningError);
//         })
//         .catch(handleSigningError);
//     } else {
//       navigator.credentials
//         .create({ publicKey: publicKeyOptions })
//         .then((credential) => {
//           setPublicKeyState((credential as any).response.clientDataJSON);

//           const privateKey = (credential as any).privateKey;

//           const algorithm = {
//             name: "RSASSA-PKCS1-v1_5",
//             hash: "SHA-256",
//           };

//           window.crypto.subtle
//             .sign(algorithm, privateKey, encodedChallenge.buffer)
//             .then((signedData: ArrayBuffer) => {
//               setSignedChallenge(signedData);
//             })
//             .catch(handleSigningError);
//         })
//         .catch(handleSigningError);
//     }
//   }, [challenge, publicKey]);
//   return {
//     signedChallenge,
//     publicKey: publicKeyState ? new TextDecoder().decode(publicKeyState) : null,
//     errorMessage,
//   };
// };

// import React, { useState, useEffect } from "react";

// const useWebAuthn = (challenge: string, publicKey?: string) => {
//   const [signedChallenge, setSignedChallenge] = useState<ArrayBuffer | null>(
//     null
//   );
//   const [publicKeyState, setPublicKeyState] = useState<ArrayBuffer | null>(
//     publicKey ? new TextEncoder().encode(publicKey).buffer : null
//   );
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);

//   useEffect(() => {
//     const encodedChallenge = new TextEncoder().encode(challenge);

//     const publicKeyOptions: PublicKeyCredentialCreationOptions = {
//       challenge: encodedChallenge.buffer,
//       rp: {
//         name: "Your Website Name",
//       },
//       user: {
//         id: new Uint8Array(16),
//         name: "User Name",
//         displayName: "User Display Name",
//       },
//       pubKeyCredParams: [
//         {
//           type: "public-key",
//           alg: -7, // ES256
//         },
//       ],
//       timeout: 60000,
//       attestation: "direct",
//     };

//     const handleSigningError = (error: Error) => {
//       setErrorMessage(error.message);
//     };

//     if (publicKey) {
//       const encodedPublicKey = new TextEncoder().encode(publicKey).buffer;
//       setPublicKeyState(encodedPublicKey);

//       const algorithm = {
//         name: "RSASSA-PKCS1-v1_5",
//         hash: "SHA-256",
//       };

//       window.crypto.subtle
//         .importKey("spki", encodedPublicKey, algorithm, true, ["sign"])
//         .then((importedKey: CryptoKey) => {
//           window.crypto.subtle
//             .sign(algorithm, importedKey, encodedChallenge.buffer)
//             .then((signedData: ArrayBuffer) => {
//               setSignedChallenge(signedData);
//             })
//             .catch(handleSigningError);
//         })
//         .catch(handleSigningError);
//     } else {
//       navigator.credentials
//         .create({ publicKey: publicKeyOptions })
//         .then((credential) => {
//           setPublicKeyState((credential as any).response.clientDataJSON);

//           const privateKey = (credential as any).privateKey;

//           const algorithm = {
//             name: "RSASSA-PKCS1-v1_5",
//             hash: "SHA-256",
//           };

//           window.crypto.subtle
//             .sign(algorithm, privateKey, encodedChallenge.buffer)
//             .then((signedData: ArrayBuffer) => {
//               setSignedChallenge(signedData);
//             })
//             .catch(handleSigningError);
//         })
//         .catch(handleSigningError);
//     }
//   }, [challenge, publicKey]);
//   return {
//     signedChallenge,
//     publicKey: publicKeyState ? new TextDecoder().decode(publicKeyState) : null,
//     errorMessage,
//   };
// };

// import React, { useState, useEffect } from "react";

// const useWebAuthn = (challenge: string, publicKey?: string) => {
//   const [signedChallenge, setSignedChallenge] = useState<ArrayBuffer | null>(
//     null
//   );
//   const [publicKeyState, setPublicKeyState] = useState<ArrayBuffer | null>(
//     publicKey ? new TextEncoder().encode(publicKey).buffer : null
//   );
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);

//   useEffect(() => {
//     const encodedChallenge = new TextEncoder().encode(challenge);

//     const publicKeyOptions: PublicKeyCredentialCreationOptions = {
//       challenge: encodedChallenge.buffer,
//       rp: {
//         name: "Your Website Name",
//       },
//       user: {
//         id: new Uint8Array(16),
//         name: "User Name",
//         displayName: "User Display Name",
//       },
//       pubKeyCredParams: [
//         {
//           type: "public-key",
//           alg: -7, // ES256
//         },
//       ],
//       timeout: 60000,
//       attestation: "direct",
//     };

//     const handleSigningError = (error: Error) => {
//       setErrorMessage(error.message);
//     };

//     if (publicKey) {
//       const encodedPublicKey = new TextEncoder().encode(publicKey).buffer;
//       setPublicKeyState(encodedPublicKey);

//       const algorithm = {
//         name: "RSASSA-PKCS1-v1_5",
//         hash: "SHA-256",
//       };

//       window.crypto.subtle
//         .sign(algorithm, encodedPublicKey, encodedChallenge.buffer)
//         .then((signedData: ArrayBuffer) => {
//           setSignedChallenge(signedData);
//         })
//         .catch(handleSigningError);
//     } else {
//       navigator.credentials
//         .create({ publicKey: publicKeyOptions })
//         .then((credential) => {
//           setPublicKeyState((credential as any).response.clientDataJSON);

//           const privateKey = (credential as any).privateKey;

//           const algorithm = {
//             name: "RSASSA-PKCS1-v1_5",
//             hash: "SHA-256",
//           };

//           window.crypto.subtle
//             .sign(algorithm, privateKey, encodedChallenge.buffer)
//             .then((signedData: ArrayBuffer) => {
//               setSignedChallenge(signedData);
//             })
//             .catch(handleSigningError);
//         })
//         .catch(handleSigningError);
//     }
//   }, [challenge, publicKey]);

//   return {
//     signedChallenge,
//     publicKey: publicKeyState ? new TextDecoder().decode(publicKeyState) : null,
//     errorMessage,
//   };
// };

// import React, { useState, useEffect } from "react";

// const useWebAuthn = (challenge: string, publicKey?: string) => {
//   const [signedChallenge, setSignedChallenge] = useState<ArrayBuffer | null>(
//     null
//   );
//   const [publicKeyState, setPublicKeyState] = useState<ArrayBuffer | null>(
//     publicKey ? new TextEncoder().encode(publicKey).buffer : null
//   );

//   useEffect(() => {
//     const encodedChallenge = new TextEncoder().encode(challenge);

//     const publicKeyOptions: PublicKeyCredentialCreationOptions = {
//       challenge: encodedChallenge.buffer,
//       rp: {
//         name: "Your Website Name",
//       },
//       user: {
//         id: new Uint8Array(16),
//         name: "User Name",
//         displayName: "User Display Name",
//       },
//       pubKeyCredParams: [
//         {
//           type: "public-key",
//           alg: -7, // ES256
//         },
//       ],
//       timeout: 60000,
//       attestation: "direct",
//     };

//     if (publicKey) {
//       const encodedPublicKey = new TextEncoder().encode(publicKey).buffer;
//       setPublicKeyState(encodedPublicKey);

//       window.crypto.subtle
//         .importKey(
//           "spki",
//           encodedPublicKey,
//           {
//             name: "RSASSA-PKCS1-v1_5",
//             hash: "SHA-256",
//           },
//           false,
//           ["sign"]
//         )
//         .then((publicKey) => {
//           const algorithm = {
//             name: "RSASSA-PKCS1-v1_5",
//             hash: "SHA-256",
//           };

//           window.crypto.subtle
//             .sign(algorithm, publicKey, encodedChallenge.buffer)
//             .then((signedData: ArrayBuffer) => {
//               setSignedChallenge(signedData);
//             });
//         });
//     } else {
//       navigator.credentials
//         .create({ publicKey: publicKeyOptions })
//         .then((credential) => {
//           setPublicKeyState((credential as any).response.clientDataJSON);

//           const privateKey = (credential as any).privateKey;

//           const algorithm = {
//             name: "RSASSA-PKCS1-v1_5",
//             hash: "SHA-256",
//           };

//           window.crypto.subtle
//             .sign(algorithm, privateKey, encodedChallenge.buffer)
//             .then((signedData: ArrayBuffer) => {
//               setSignedChallenge(signedData);
//             });
//         });
//     }
//   }, [challenge, publicKey]);

//   return { signedChallenge, publicKey: publicKeyState };
// };

// import React, { useState, useEffect } from "react";

// const useWebAuthn = (challenge: string, publicKey?: string) => {
//   const [signedChallenge, setSignedChallenge] = useState<ArrayBuffer | null>(
//     null
//   );
//   const [publicKeyState, setPublicKeyState] = useState<ArrayBuffer | null>(
//     publicKey ? new TextEncoder().encode(publicKey).buffer : null
//   );

//   useEffect(() => {
//     const encodedChallenge = new TextEncoder().encode(challenge);

//     const publicKeyOptions: PublicKeyCredentialCreationOptions = {
//       challenge: encodedChallenge.buffer,
//       rp: {
//         name: "Your Website Name",
//       },
//       user: {
//         id: new Uint8Array(16),
//         name: "User Name",
//         displayName: "User Display Name",
//       },
//       pubKeyCredParams: [
//         {
//           type: "public-key",
//           alg: -7, // ES256
//         },
//       ],
//       timeout: 60000,
//       attestation: "direct",
//     };

//     if (publicKey) {
//       const encodedPublicKey = new TextEncoder().encode(publicKey).buffer;
//       setPublicKeyState(encodedPublicKey);

//       const algorithm = {
//         name: "RSASSA-PKCS1-v1_5",
//         hash: "SHA-256",
//       };

//       window.crypto.subtle
//         .sign(algorithm, encodedPublicKey, encodedChallenge.buffer)
//         .then((signedData: ArrayBuffer) => {
//           setSignedChallenge(signedData);
//         });
//     } else {
//       navigator.credentials
//         .create({ publicKey: publicKeyOptions })
//         .then((credential) => {
//           setPublicKeyState((credential as any).response.clientDataJSON);

//           const privateKey = (credential as any).privateKey;

//           const algorithm = {
//             name: "RSASSA-PKCS1-v1_5",
//             hash: "SHA-256",
//           };

//           window.crypto.subtle
//             .sign(algorithm, privateKey, encodedChallenge.buffer)
//             .then((signedData: ArrayBuffer) => {
//               setSignedChallenge(signedData);
//             });
//         });
//     }
//   }, [challenge, publicKey]);

//   return { signedChallenge, publicKey: publicKeyState };
// };

// use the crypto.subtle.importKey method to import the encodedPublicKey as a CryptoKey object, which can then be used with the sign method

// import React, { useState, useEffect } from "react";

// const useWebAuthn = (challenge: string, publicKey?: string) => {
//   const [signedChallenge, setSignedChallenge] = useState<ArrayBuffer | null>(
//     null
//   );
//   const [publicKeyState, setPublicKeyState] = useState<ArrayBuffer | null>(
//     publicKey ? new TextEncoder().encode(publicKey).buffer : null
//   );

//   useEffect(() => {
//     const encodedChallenge = new TextEncoder().encode(challenge);

//     const publicKeyOptions: PublicKeyCredentialCreationOptions = {
//       challenge: encodedChallenge.buffer,
//       rp: {
//         name: "Your Website Name",
//       },
//       user: {
//         id: new Uint8Array(16),
//         name: "User Name",
//         displayName: "User Display Name",
//       },
//       pubKeyCredParams: [
//         {
//           type: "public-key",
//           alg: -7, // ES256
//         },
//       ],
//       timeout: 60000,
//       attestation: "direct",
//     };

//     if (publicKey) {
//       const encodedPublicKey = new TextEncoder().encode(publicKey).buffer;
//       setPublicKeyState(encodedPublicKey);

//       const algorithm = {
//         name: "RSASSA-PKCS1-v1_5",
//         hash: "SHA-256",
//       };

//       window.crypto.subtle
//         .sign(algorithm, encodedPublicKey, encodedChallenge.buffer)
//         .then((signedData: ArrayBuffer) => {
//           setSignedChallenge(signedData);
//         });
//     } else {
//       navigator.credentials
//         .create({ publicKey: publicKeyOptions })
//         .then((credential) => {
//           setPublicKeyState((credential as any).response.clientDataJSON);

//           const privateKey = (credential as any).privateKey;

//           const algorithm = {
//             name: "RSASSA-PKCS1-v1_5",
//             hash: "SHA-256",
//           };

//           window.crypto.subtle
//             .sign(algorithm, privateKey, encodedChallenge.buffer)
//             .then((signedData: ArrayBuffer) => {
//               setSignedChallenge(signedData);
//             });
//         });
//     }
//   }, [challenge, publicKey]);

//   return { signedChallenge, publicKey: publicKeyState };
// };

// import React, { useState, useEffect } from "react";

// const useWebAuthn = (challenge: string, publicKey?: ArrayBuffer) => {
//   const [signedChallenge, setSignedChallenge] = useState<ArrayBuffer | null>(
//     null
//   );
//   const [publicKeyState, setPublicKeyState] = useState<ArrayBuffer | null>(
//     publicKey || null
//   );

//   useEffect(() => {
//     const encodedChallenge = new TextEncoder().encode(challenge);

//     const publicKeyOptions: PublicKeyCredentialCreationOptions = {
//       challenge: encodedChallenge.buffer,
//       rp: {
//         name: "Your Website Name",
//       },
//       user: {
//         id: new Uint8Array(16),
//         name: "User Name",
//         displayName: "User Display Name",
//       },
//       pubKeyCredParams: [
//         {
//           type: "public-key",
//           alg: -7, // ES256
//         },
//       ],
//       timeout: 60000,
//       attestation: "direct",
//     };

//     if (publicKey) {
//       setPublicKeyState(publicKey);
//     } else {
//       navigator.credentials
//         .create({ publicKey: publicKeyOptions })
//         .then((credential) => {
//           setPublicKeyState((credential as any).response.clientDataJSON);

//           const privateKey = (credential as any).privateKey;

//           const algorithm = {
//             name: "RSASSA-PKCS1-v1_5",
//             hash: "SHA-256",
//           };

//           window.crypto.subtle
//             .sign(algorithm, privateKey, encodedChallenge.buffer)
//             .then((signedData: ArrayBuffer) => {
//               setSignedChallenge(signedData);
//             });
//         });
//     }
//   }, [challenge, publicKey]);

//   return { signedChallenge, publicKey: publicKeyState };
// };

// import { useState, useEffect } from "react";

// const useWebAuthn = (challenge: string) => {
//   const [signedChallenge, setSignedChallenge] = useState<ArrayBuffer | null>(
//     null
//   );
//   const [publicKey, setPublicKey] = useState<ArrayBuffer | null>(null);

//   useEffect(() => {
//     const encodedChallenge = new TextEncoder().encode(challenge);

//     const publicKeyOptions: PublicKeyCredentialCreationOptions = {
//       challenge: encodedChallenge.buffer,
//       rp: {
//         name: "Your Website Name",
//       },
//       user: {
//         id: new Uint8Array(16),
//         name: "User Name",
//         displayName: "User Display Name",
//       },
//       pubKeyCredParams: [
//         {
//           type: "public-key",
//           alg: -7, // ES256
//         },
//       ],
//       timeout: 60000,
//       attestation: "direct",
//     };

//     navigator.credentials
//       .create({ publicKey: publicKeyOptions })
//       .then((credential) => {
//         setPublicKey((credential as any).response.clientDataJSON);

//         const privateKey = (credential as any).privateKey;

//         const algorithm = {
//           name: "RSASSA-PKCS1-v1_5",
//           hash: "SHA-256",
//         };

//         window.crypto.subtle
//           .sign(algorithm, privateKey, encodedChallenge.buffer)
//           .then((signedData: ArrayBuffer) => {
//             setSignedChallenge(signedData);
//           });
//       });
//   }, [challenge]);

//   return { signedChallenge, publicKey };
// };

// // The signedChallenge can be verified using the publicKey on the server. The exact method for verification depends on the cryptographic algorithm used for signing the challenge. In this case, the algorithm used is RSASSA-PKCS1-v1_5 with SHA-256, which is a commonly used signature algorithm.
