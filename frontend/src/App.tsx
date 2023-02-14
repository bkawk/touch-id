import useWebAuthnSupport from "./hooks/useWebAuthnSupport";
import useAPI from "./hooks/useAPI";
import useGetPassKey from "./hooks/useGetPassKey";

import "./App.css";

function App() {
  const body = {
    userId: "0966d059c9b93",
  };

  const supported = useWebAuthnSupport();
  const challenge = useAPI("http://localhost:8080/challenge", "POST", body);
  const { credential, error } = useGetPassKey(
    challenge.res?.claim,
    body.userId
  );

  return (
    <div className="App">
      <header className="App-header">
        {JSON.stringify(credential)}
        {JSON.stringify(error)}
        {challenge.res?.claim && (
          <button onClick={challenge.fire}>Sign Challenge</button>
        )}
        {challenge.res?.claim}
        {challenge.err}
        {challenge.loading}
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
