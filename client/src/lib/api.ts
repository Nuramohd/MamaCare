const API_URL = "http://<your-server-ip>:5000/api"; 
// when you deploy backend → replace with live URL (e.g. Render/Heroku/Vercel server)

export async function sendMessage(message: string) {
  const res = await fetch(`${API_URL}/openai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    throw new Error("API request failed");
  }

  return res.json();
}
