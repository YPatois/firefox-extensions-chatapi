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

// Fonction pour extraire tout le texte d'un conteneur de message
const getFullMessageText = (messageNode) => {
    const textContainer = messageNode.querySelector("[data-testid='text-message-part']");
    if (!textContainer) return null;
    return textContainer.textContent.trim();
};

// Dictionnaire pour suivre les messages en cours de modification
const pendingMessages = {};

// Fonction pour envoyer les mises à jour du message toutes les 500ms
const sendMessageUpdate = (messageId, role, text) => {
    if (pendingMessages[messageId]) {
        clearTimeout(pendingMessages[messageId]);
    }
    pendingMessages[messageId] = setTimeout(() => {
        console.log(`📤 Mise à jour du message (${role}):`, text);
        browser.runtime.sendMessage({
            type: role === "user" ? "user_message" : "bot_response",
            data: text,
            isPartial: true, // Indique que c'est une mise à jour partielle
        });
    }, 500); // Envoie toutes les 500ms
};

const observeChatResponses = () => {
    const chatContainer = document.querySelector("[data-testid='conversation-layout']");
    if (!chatContainer) {
        console.error("Conteneur introuvable, réessai dans 1s...");
        setTimeout(observeChatResponses, 1000);
        return;
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Cas 1: Le nœud est un message
                    if (node.hasAttribute("data-message-author-role")) {
                        const messageId = node.getAttribute("data-message-id");
                        const role = node.getAttribute("data-message-author-role");
                        const text = getFullMessageText(node);
                        if (text && messageId) {
                            sendMessageUpdate(messageId, role, text);
                        }
                    }
                    // Cas 2: Parcourir les enfants pour trouver des messages
                    else {
                        const messages = node.querySelectorAll("[data-message-author-role]");
                        messages.forEach((msgNode) => {
                            const messageId = msgNode.getAttribute("data-message-id");
                            const role = msgNode.getAttribute("data-message-author-role");
                            const text = getFullMessageText(msgNode);
                            if (text && messageId) {
                                sendMessageUpdate(messageId, role, text);
                            }
                        });
                    }
                }
            });
        });
    });

    observer.observe(chatContainer, {
        childList: true,
        subtree: true,
        characterData: true, // Pour capturer les modifications de texte
    });
    console.log("Observation démarrée sur le conteneur :", chatContainer);
};

// Démarrer l'observation
observeChatResponses();
