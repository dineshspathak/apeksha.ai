// Apeksha AI - Web UI JavaScript

const messagesContainer = document.getElementById('messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

let isProcessing = false;
let activeBrain = 'buddhi';

// Load status on startup
fetchStatus();

function switchBrain(brain) {
    activeBrain = brain;
}

async function fetchStatus() {
    try {
        const res = await fetch('/api/status');
        const data = await res.json();
        document.getElementById('model-name').textContent = '● Online';
    } catch (e) {
        document.getElementById('model-name').textContent = '○ Offline';
    }
}

function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
}

function sendSuggestion(text) {
    userInput.value = text;
    sendMessage();
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message || isProcessing) return;

    isProcessing = true;
    sendBtn.disabled = true;

    // Remove welcome message if present
    const welcome = document.querySelector('.welcome-message');
    if (welcome) welcome.remove();

    // Add user message
    addMessage('user', message);
    userInput.value = '';
    userInput.style.height = 'auto';

    // Add loading indicator
    const loadingEl = addLoading();

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, brain: activeBrain }),
        });

        const data = await res.json();

        // Remove loading
        loadingEl.remove();

        // Show tool activities if any
        if (data.tools && data.tools.length > 0) {
            addToolActivity(data.tools);
        }

        // Show response
        if (data.response) {
            addMessage('assistant', data.response);
        }

        // Refresh status
        fetchStatus();

    } catch (error) {
        loadingEl.remove();
        addMessage('assistant', `Error: Could not reach Apeksha. Make sure Ollama is running.\n\n${error.message}`);
    }

    isProcessing = false;
    sendBtn.disabled = false;
    userInput.focus();
}

function addMessage(role, content) {
    const div = document.createElement('div');
    div.className = `message message-${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    if (role === 'assistant') {
        bubble.innerHTML = formatMarkdown(content);
    } else {
        bubble.textContent = content;
    }

    div.appendChild(bubble);
    messagesContainer.appendChild(div);
    scrollToBottom();
}

function addToolActivity(tools) {
    const div = document.createElement('div');
    div.className = 'message message-assistant';

    const activity = document.createElement('div');
    activity.className = 'tool-activity';

    let html = '';
    for (const tool of tools) {
        if (tool.type === 'tool_start') {
            html += `<div><span class="tool-name">${escapeHtml(tool.content)}</span></div>`;
        } else if (tool.type === 'tool_result') {
            const preview = tool.content.substring(0, 200);
            html += `<div style="margin-left: 16px; opacity: 0.7">↳ ${escapeHtml(preview)}</div>`;
        }
    }

    activity.innerHTML = html;
    div.appendChild(activity);
    messagesContainer.appendChild(div);
}

function addLoading() {
    const div = document.createElement('div');
    div.className = 'message message-assistant';
    div.innerHTML = `
        <div class="loading-dots">
            <span></span><span></span><span></span>
        </div>
    `;
    messagesContainer.appendChild(div);
    scrollToBottom();
    return div;
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function resetChat() {
    try {
        await fetch('/api/reset', { method: 'POST' });
        messagesContainer.innerHTML = `
            <div class="welcome-message">
                <img src="/static/logo.png" alt="Apeksha AI" style="width:80px;height:80px;margin:0 auto 16px;display:block;border-radius:12px;">
                <h2>Hello! I'm Apeksha.</h2>
                <p>Your AI assistant. I can build software, answer questions, search the web, and learn from your documents.</p>
                <div class="suggestions">
                    <button onclick="sendSuggestion('Build a React todo app with local storage')">Build a React todo app</button>
                    <button onclick="sendSuggestion('Create a Python REST API with Flask')">Create a Flask API</button>
                    <button onclick="sendSuggestion('Search the web for latest AI news')">Search AI news</button>
                    <button onclick="sendSuggestion('Help me write a Python script to organize my files')">Organize my files</button>
                </div>
            </div>
        `;
    } catch (e) {
        console.error('Failed to reset:', e);
    }
}

async function ingestKnowledge() {
    try {
        const res = await fetch('/api/ingest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });
        const data = await res.json();
        alert(data.message);
        fetchStatus();
    } catch (e) {
        alert('Error ingesting documents: ' + e.message);
    }
}

// Simple markdown to HTML converter
function formatMarkdown(text) {
    let html = escapeHtml(text);

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Numbered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';

    // Clean up empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, '');

    return html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
