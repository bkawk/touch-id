import useWebAuthnSupport from "./hooks/useWebAuthnSupport";
import useAPI from "./hooks/useAPI";

import "./App.css";

function App() {
  const body = {
    userId: "0966d059c9b93",
  };
  const challenge = useAPI("http://localhost:8080/challenge", "POST", body);

  const supported = useWebAuthnSupport();
  return (
    <div className="App">
      <header className="App-header">
        {challenge.res.claim}
        {JSON.stringify(challenge.err)}
        {JSON.stringify(challenge.loading)}
        <button onClick={challenge.fire}>Get challenge</button>
        {supported ? (
          <p>WebAuthn is supported in this browser.</p>
        ) : (
          <p>WebAuthn is not supported in this browser.</p>
        )}
      </header>
    </div>
  );
}

export default App;
