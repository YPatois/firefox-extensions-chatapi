// Écoute les messages envoyés depuis content.js
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "user_message":
      console.log("Message utilisateur intercepté :", message.data);
      // Envoyer le message à votre serveur local (ex: Python)
      sendToLocalServer({ prompt: message.data });
      break;
    case "bot_response":
      console.log("Réponse du bot interceptée :", message.data);
      // Envoyer la réponse à votre serveur local
      sendToLocalServer({ response: message.data });
      break;
    default:
      console.warn("Type de message inconnu :", message.type);
  }
});

// Fonction pour communiquer avec le serveur local (ex: Flask/FastAPI)
function sendToLocalServer(data) {
  // Utilisez browser.runtime.sendNativeMessage si vous avez configuré nativeMessaging
  // ou une requête HTTP vers localhost si vous préférez REST
  fetch("http://localhost:5000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => console.log("Réponse du serveur local :", data))
    .catch((error) => console.error("Erreur :", error));
}

// Écoute le clic sur l'icône de l'extension (optionnel)
browser.browserAction.onClicked.addListener(() => {
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    browser.tabs.sendMessage(tabs[0].id, { type: "ping" });
  });
});
