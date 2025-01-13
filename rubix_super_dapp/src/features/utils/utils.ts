export function decodeJwtPayload(token: string): string | null {
    try {
      const payloadBase64 = token.split('.')[1]; // Extract the payload part
      return atob(payloadBase64); // Decode base64 to JSON string
    } catch (error) {
      console.error("Invalid token or parsing error:", error);
      return null;
    }
}
  

export function getDIDFromJwtPayload(token: string): string {
    const payloadJson = decodeJwtPayload(token); // Get the decoded JSON string
    if (!payloadJson) return "";

    try {
        const payload = JSON.parse(payloadJson); // Parse JSON string to an object
        return payload.sub || ""; // Return the "sub" value if it exists
    } catch (error) {
        console.error("Error parsing JSON:", error);
        return "";
    }
}

