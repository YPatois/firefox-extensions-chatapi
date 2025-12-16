// Log de confirmation
console.log("%c Content script chargé et prêt à intercepter les messages !", "background: #222; color: #bada55;");

// Écoute les messages envoyés par l'utilisateur
document.addEventListener("submit", (e) => {
    if (e.target.matches("form")) {
        console.log("Formulaire soumis");
        const messageInput = e.target.querySelector("input[type='text'], textarea");
        if (messageInput) {
            const message = messageInput.value;
            console.log("Message utilisateur intercepté :", message);
            browser.runtime.sendMessage({ type: "user_message", data: message });
        }
    }
});

// Écoute les réponses du chat (messages de l'IA)
const observeChatResponses = () => {
    // Sélecteur du conteneur principal des messages (adapté d'après votre DOM)
    const chatContainer = document.querySelector("[data-testid='conversation-layout']");
    if (!chatContainer) {
        setTimeout(observeChatResponses, 1000);
        return;
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            console.log("Mutation observée:", mutation);
            mutation.addedNodes.forEach((node) => {
                // Vérifie que le nœud est un message (utilisateur ou assistant)
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Cible les messages avec data-message-author-role="user" ou "assistant"
                    if (node.getAttribute("data-message-author-role") === "user" ||
                        node.getAttribute("data-message-author-role") === "assistant") {
                        // Extrait le texte du message (adapté d'après votre DOM)
                        const messageTextElement = node.querySelector("[data-testid='text-message-part'] p");
                        if (messageTextElement) {
                            const response = messageTextElement.textContent.trim();
                            console.log(`Message intercepté (${node.getAttribute("data-message-author-role")}):`, response);
                            browser.runtime.sendMessage({
                                type: node.getAttribute("data-message-author-role") === "user" ? "user_message" : "bot_response",
                                data: response
                            });
                        }
                    }
                }
            });
        });
    });

  observer.observe(chatContainer, { childList: true, subtree: true });
  console.log("Observation des réponses du chat démarrée (filtre activé).");
};

// Démarrer l'observation
observeChatResponses();
