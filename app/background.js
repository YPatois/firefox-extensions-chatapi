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

function sendToLocalServer(data) {
  fetch("http://localhost:3000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => console.log("Réponse du serveur local :", data))
  .catch((error) => {
    console.error("Erreur lors de l'envoi au serveur :", error);
    // Optionnel : Stocker les messages localement en cas d'échec
    storeMessageLocally(data);
  });
}

// Fonction pour stocker les messages localement en cas d'échec réseau
function storeMessageLocally(data) {
  const storedMessages = JSON.parse(localStorage.getItem("pendingMessages") || "[]");
  storedMessages.push(data);
  localStorage.setItem("pendingMessages", JSON.stringify(storedMessages));
  console.log("Message stocké localement (en attente d'envoi) :", data);
}

// Écoute le clic sur l'icône de l'extension (optionnel)
browser.browserAction.onClicked.addListener(() => {
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    browser.tabs.sendMessage(tabs[0].id, { type: "ping" });
  });
});
