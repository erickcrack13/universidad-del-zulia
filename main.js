document.addEventListener('DOMContentLoaded', () => {

    // --- Elementos del DOM ---
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    // --- NUEVO: Función de Normalización ---
    // Convierte el texto a minúsculas y le quita los acentos.
    const normalizeString = (str) => {
        return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    // --- Estado de la Conversación ---
    let conversationState = { state: 'idle', currentUser: null };

    // --- Respuestas predefinidas del Bot ---
    const botResponses = {
        "hola": { 
            answer: "¡Hola! Soy tu asistente virtual de la universidad. ¿En qué te puedo ayudar hoy?", 
            suggestions: ["Ver mis notas", "Admisiones", "Ubicación"]
        },
        "admisiones": { 
            answer: "Puedes encontrar toda la información sobre admisiones en nuestro sitio web oficial.", 
            suggestions: ["Costo de inscripción", "Requisitos de admisión"]
        },
        "costo_inscripcion": { 
            getAnswer: () => {
                const price = localStorage.getItem('inscriptionPrice') || '100';
                return `El costo de inscripción para nuevos estudiantes es de ${price} USD (o su equivalente en Bolívares a la tasa del día).`;
            },
            suggestions: ["Métodos de pago", "Ubicación", "Volver al inicio"]
        },
        "metodos_pago": { 
            answer: "Puedes pagar la inscripción a través de transferencia bancaria o directamente en la caja de la universidad.", 
            suggestions: ["Costo de inscripción", "Volver al inicio"]
        },
        "ubicacion": { 
            answer: "¡Claro! Nuestra facultad principal se encuentra en la Av. 16 Guajira, Maracaibo, Estado Zulia. Justo al lado del Hospital Universitario.",
            suggestions: ["Ver mis notas", "Costo de inscripción"]
        },
        "default": { 
            answer: "Lo siento, no tengo una respuesta para eso. Intenta con una de estas opciones.", 
            suggestions: ["Ver mis notas", "Admisiones", "Ubicación"]
        }
    };

    // --- Funciones de la UI ---
    const displayMessage = (message, sender) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${sender}-message`);
        messageElement.innerText = message;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    const displaySuggestions = (suggestions) => {
        if (!suggestions || suggestions.length === 0) return;
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.classList.add('suggestions-container');
        suggestions.forEach(suggestion => {
            const button = document.createElement('button');
            button.classList.add('suggestion-btn');
            button.innerText = suggestion;
            button.addEventListener('click', () => handleUserInput(suggestion));
            suggestionsContainer.appendChild(button);
        });
        chatBox.appendChild(suggestionsContainer);
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    const showTypingIndicator = () => {
        const indicator = document.createElement('div');
        indicator.classList.add('chat-message', 'bot-message', 'typing-indicator');
        indicator.innerHTML = '<span></span><span></span><span></span>';
        chatBox.appendChild(indicator);
        chatBox.scrollTop = chatBox.scrollHeight;
        return indicator;
    };

    // --- Lógica de Inicialización ---
    displayMessage(botResponses.hola.answer, 'bot');
    displaySuggestions(botResponses.hola.suggestions);

    // --- Lógica de Conversación (CORREGIDA) ---
    const getStandardResponse = (userMessage) => {
        const message = normalizeString(userMessage); // Usamos la normalización
        if (message.includes("hola")) return botResponses.hola;
        if (message.includes("admision")) return botResponses.admisiones;
        if (message.includes("costo") || message.includes("inscripcion") || message.includes("matricula")) return botResponses.costo_inscripcion;
        if (message.includes("pago") || message.includes("pagar")) return botResponses.metodos_pago;
        if (message.includes("direccion") || message.includes("ubicacion") || message.includes("donde")) return botResponses.ubicacion;
        return botResponses.default;
    };

    const handleGradeInquiry = (userMessage) => {
        let botResponse = {};
        const getDB = () => JSON.parse(localStorage.getItem('studentDB'));
        const normalizedUserMessage = normalizeString(userMessage);

        switch (conversationState.state) {
            case 'awaiting_name':
                conversationState.currentUser = { name: userMessage };
                conversationState.state = 'awaiting_cedula';
                botResponse.answer = `¡Hola, ${userMessage}! Ahora, por favor, ingresa tu número de cédula para verificar.`;
                break;
            case 'awaiting_cedula':
                const cedula = userMessage;
                const studentDB = getDB();
                const student = studentDB.find(s => s.id === cedula);
                if (student && normalizeString(student.name) === normalizeString(conversationState.currentUser.name)) {
                    conversationState.currentUser.grades = student.grades;
                    conversationState.state = 'awaiting_subject';
                    botResponse.answer = `¡Gracias! Verificación completa. ¿De qué materia quieres saber tu nota?`;
                    botResponse.suggestions = Object.keys(student.grades);
                } else {
                    botResponse.answer = "El nombre o la cédula no coinciden. Volvamos a empezar.";
                    conversationState.state = 'idle';
                    botResponse.suggestions = botResponses.hola.suggestions;
                }
                break;
            case 'awaiting_subject':
                const grades = conversationState.currentUser.grades;
                const foundSubjectKey = Object.keys(grades).find(key => normalizeString(key) === normalizedUserMessage);
                if (foundSubjectKey) {
                    botResponse.answer = `Tu nota en ${foundSubjectKey} es de ${grades[foundSubjectKey]}.`;
                } else {
                    botResponse.answer = `No encontré una nota para \"${userMessage}\".`;
                }
                botResponse.suggestions = Object.keys(grades).filter(s => normalizeString(s) !== normalizedUserMessage);
                botResponse.suggestions.push("Volver al inicio");
                break;
        }
        return botResponse;
    };

    const handleUserInput = (messageOverride) => {
        const userMessage = messageOverride || userInput.value.trim();
        if (!userMessage) return;
        displayMessage(userMessage, 'user');
        if (!messageOverride) userInput.value = '';
        const typingIndicator = showTypingIndicator();
        let botResponse;
        const normalizedMessage = normalizeString(userMessage);

        if ((normalizedMessage === 'salir' || normalizedMessage === 'volver al inicio') && conversationState.state !== 'idle') {
            conversationState.state = 'idle';
            botResponse = botResponses.hola;
        } else if (conversationState.state !== 'idle') {
            botResponse = handleGradeInquiry(userMessage);
        } else {
            if (normalizedMessage.includes("nota") || normalizedMessage.includes("calificacion")) {
                conversationState.state = 'awaiting_name';
                botResponse = { answer: "¡Claro! Para consultar tus notas, primero necesito tu nombre completo." };
            } else {
                botResponse = getStandardResponse(userMessage);
            }
        }

        setTimeout(() => {
            if (typingIndicator.parentNode) typingIndicator.parentNode.removeChild(typingIndicator);
            const answer = botResponse && typeof botResponse.getAnswer === 'function' ? botResponse.getAnswer() : (botResponse ? botResponse.answer : null);
            if (answer) {
                displayMessage(answer, 'bot');
                displaySuggestions(botResponse.suggestions);
            } else {
                conversationState.state = 'idle';
                displayMessage(botResponses.default.answer, 'bot');
                displaySuggestions(botResponses.default.suggestions);
            }
        }, 200);
    };

    // --- Event Listeners ---
    sendBtn.addEventListener('click', () => handleUserInput());
    userInput.addEventListener('keydown', (event) => event.key === 'Enter' && handleUserInput());
});
