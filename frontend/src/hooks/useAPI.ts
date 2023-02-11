import { useState, useEffect } from "react";

interface FetchRes {
  res: any | null;
  err: Error | null;
  loading: boolean;
  fire: () => void;
}

const useAPI = (
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: object,
  bearer?: string
): FetchRes => {
  const [res, setRes] = useState<any | null>(null);
  const [err, setErr] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const fire = async () => {
    setLoading(true);
    try {
      const headers: Headers = new Headers();
      headers.append("Content-Type", "application/json");
      if (bearer) {
        headers.append("Authorization", `Bearer ${bearer}`);
      }
      const options: RequestInit = {
        method,
        headers,
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch data: ${response.status} ${response.statusText}`
        );
      }

      let data: any;
      if (
        response.headers.get("Content-Type")?.startsWith("application/json")
      ) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      setRes(data);
    } catch (error: any) {
      setErr(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Do nothing
  }, []);

  return { res, err, loading, fire };
};

export default useAPI;
