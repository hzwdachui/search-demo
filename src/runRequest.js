import fetch from "node-fetch";
export default async function runRequest(body) {
  const response = await fetch("/national-parks/_search", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  return response.json();
}
