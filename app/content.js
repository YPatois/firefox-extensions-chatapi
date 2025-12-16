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


const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.hasAttribute("data-message-author-role")) {
                    const messageTextElement = node.querySelector("[data-testid='text-message-part'] p");
                    if (messageTextElement) {
                        const text = messageTextElement.textContent.trim();
                        // Vérifier que le texte n'est pas vide ou trop court
                        if (text && text.length > 1) {
                            const role = node.getAttribute("data-message-author-role");
                            console.log(`✅ Message intercepté (${role}):`, text);
                            browser.runtime.sendMessage({
                                type: role === "user" ? "user_message" : "bot_response",
                                data: text
                            });
                        }
                    }
                }
                // Parcourir les enfants
                else {
                    const messages = node.querySelectorAll("[data-message-author-role]");
                    messages.forEach((msgNode) => {
                        const messageTextElement = msgNode.querySelector("[data-testid='text-message-part'] p");
                        if (messageTextElement) {
                            const text = messageTextElement.textContent.trim();
                            if (text && text.length > 1) {
                                const role = msgNode.getAttribute("data-message-author-role");
                                console.log(`✅ Message imbriqué intercepté (${role}):`, text);
                                browser.runtime.sendMessage({
                                    type: role === "user" ? "user_message" : "bot_response",
                                    data: text
                                });
                            }
                        }
                    });
                }
            }
        });
    });
});


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
                // On ne traite que les éléments DOM
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // 1. Vérifier si le nœud est un message (a l'attribut data-message-author-role)
                    if (node.hasAttribute("data-message-author-role")) {
                        const messageTextElement = node.querySelector("[data-testid='text-message-part'] p");
                        if (messageTextElement) {
                            const text = messageTextElement.textContent.trim();
                            const role = node.getAttribute("data-message-author-role");
                            console.log(`✅ Message intercepté (${role}):`, text);
                            browser.runtime.sendMessage({
                                type: role === "user" ? "user_message" : "bot_response",
                                data: text
                            });
                        }
                    }
                    // 2. Parcourir les enfants pour trouver des messages imbriqués
                    else {
                        const messages = node.querySelectorAll("[data-message-author-role]");
                        messages.forEach((msgNode) => {
                            const messageTextElement = msgNode.querySelector("[data-testid='text-message-part'] p");
                            if (messageTextElement) {
                                const text = messageTextElement.textContent.trim();
                                const role = msgNode.getAttribute("data-message-author-role");
                                console.log(`✅ Message imbriqué intercepté (${role}):`, text);
                                browser.runtime.sendMessage({
                                    type: role === "user" ? "user_message" : "bot_response",
                                    data: text
                                });
                            }
                        });
                    }
                }
            });
        });
    });

    observer.observe(chatContainer, { childList: true, subtree: true });
    console.log("Observation démarrée sur le conteneur :", chatContainer);
};

// Démarrer l'observation
observeChatResponses();
