// ===================================
// GLOBAL VARIABLES & STATE
// ===================================
let chatMessages = [];
let isTyping = false;

// ===================================
// DOM CONTENT LOADED
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeSmoothScroll();
    initializeBackToTop();
    initializeChatWidget();
    initializeResponsiveNav();
    highlightActiveSection();
});

// ===================================
// NAVIGATION FUNCTIONALITY
// ===================================
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, .sidebar-link, .sidebar-sublink');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Only prevent default if it's a hash link
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // Smooth scroll to target
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const offset = navbarHeight + headerHeight + 20;
                    
                    const targetPosition = targetElement.offsetTop - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update active state for nav links
                    if (this.classList.contains('nav-link')) {
                        document.querySelectorAll('.nav-link').forEach(navLink => {
                            navLink.classList.remove('active');
                        });
                        this.classList.add('active');
                    }
                }
            }
        });
    });
}

// ===================================
// SMOOTH SCROLL
// ===================================
function initializeSmoothScroll() {
    // Already handled in navigation, but can add additional smooth scroll behaviors here
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        if (!anchor.classList.contains('nav-link') && 
            !anchor.classList.contains('sidebar-link') && 
            !anchor.classList.contains('sidebar-sublink')) {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        }
    });
}

// ===================================
// BACK TO TOP BUTTON
// ===================================
function initializeBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===================================
// HIGHLIGHT ACTIVE SECTION ON SCROLL
// ===================================
function highlightActiveSection() {
    const sections = document.querySelectorAll('.content-section, .subsection');
    const navLinks = document.querySelectorAll('.nav-link, .sidebar-link, .sidebar-sublink');
    
    window.addEventListener('scroll', function() {
        let current = '';
        const navbarHeight = document.querySelector('.navbar').offsetHeight;
        const headerHeight = document.querySelector('.header').offsetHeight;
        const offset = navbarHeight + headerHeight + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= (sectionTop - offset)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}

// ===================================
// RESPONSIVE NAVIGATION
// ===================================
function initializeResponsiveNav() {
    // Add mobile menu functionality if needed
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > lastScroll && currentScroll > 200) {
            // Scrolling down
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });
}

// ===================================
// CHAT WIDGET FUNCTIONALITY
// ===================================
function initializeChatWidget() {
    const chatToggleBtn = document.getElementById('chatToggleBtn');
    const chatToggleNav = document.getElementById('chatToggle');
    const chatWidget = document.getElementById('chatWidget');
    const chatClose = document.getElementById('chatClose');
    const chatSend = document.getElementById('chatSend');
    const chatInput = document.getElementById('chatInput');
    const suggestionBtns = document.querySelectorAll('.suggestion-btn');
    
    // Toggle chat widget
    if (chatToggleBtn) {
        chatToggleBtn.addEventListener('click', function() {
            toggleChat();
        });
    }
    
    if (chatToggleNav) {
        chatToggleNav.addEventListener('click', function(e) {
            e.preventDefault();
            toggleChat();
        });
    }
    
    // Close chat
    if (chatClose) {
        chatClose.addEventListener('click', function() {
            closeChat();
        });
    }
    
    // Send message
    if (chatSend) {
        chatSend.addEventListener('click', function() {
            sendMessage();
        });
    }
    
    // Send message on Enter (but allow Shift+Enter for new line)
    if (chatInput) {
        chatInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Auto-resize textarea
        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }
    
    // Suggestion buttons
    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const message = this.getAttribute('data-message');
            chatInput.value = message;
            sendMessage();
        });
    });
}

function toggleChat() {
    const chatWidget = document.getElementById('chatWidget');
    chatWidget.classList.toggle('active');
    
    if (chatWidget.classList.contains('active')) {
        document.getElementById('chatInput').focus();
    }
}

function closeChat() {
    const chatWidget = document.getElementById('chatWidget');
    chatWidget.classList.remove('active');
}

async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message || isTyping) return;
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    
    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Call AI API
    isTyping = true;
    showTypingIndicator();
    
    try {
        // Gọi Groq Cloud API
        const aiResponse = await generateAIResponse(message);
        removeTypingIndicator();
        addMessageToChat(aiResponse, 'ai');
    } catch (error) {
        removeTypingIndicator();
        console.error('Error getting AI response:', error);
        addMessageToChat(
            'Xin lỗi, đã xảy ra lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại sau hoặc kiểm tra kết nối internet.',
            'ai'
        );
    } finally {
        isTyping = false;
    }
}

function addMessageToChat(message, sender) {
    const chatBody = document.getElementById('chatBody');
    
    // Remove welcome message if it exists
    const welcomeMsg = chatBody.querySelector('.chat-welcome');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    // Nếu là AI response, render markdown
    if (sender === 'ai') {
        bubble.innerHTML = renderMarkdown(message);
        
        // Thêm nút copy cho AI response
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.title = 'Copy response';
        copyBtn.onclick = function() {
            copyToClipboard(message, copyBtn);
        };
        bubble.appendChild(copyBtn);
    } else {
        // User message giữ nguyên plain text
        bubble.textContent = message;
    }
    
    messageDiv.appendChild(bubble);
    chatBody.appendChild(messageDiv);
    
    // Scroll to bottom smoothly
    setTimeout(() => {
        chatBody.scrollTo({
            top: chatBody.scrollHeight,
            behavior: 'smooth'
        });
    }, 100);
    
    // Store message
    chatMessages.push({ message, sender, timestamp: Date.now() });
}

/**
 * Copy text to clipboard với feedback
 */
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        // Success feedback
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Copy failed:', err);
        // Fallback: show error
        button.innerHTML = '<i class="fas fa-times"></i>';
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
    });
}

/**
 * Render markdown text thành HTML
 * Hỗ trợ: bold, italic, lists, headers, code blocks, links, blockquotes
 */
function renderMarkdown(text) {
    if (!text) return '';
    
    let html = text;
    
    // Step 1: Protect code blocks from further processing
    const codeBlocks = [];
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, lang, code) {
        const index = codeBlocks.length;
        codeBlocks.push(`<pre><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`);
        return `___CODE_BLOCK_${index}___`;
    });
    
    // Step 2: Protect inline code
    const inlineCodes = [];
    html = html.replace(/`([^`]+)`/g, function(match, code) {
        const index = inlineCodes.length;
        inlineCodes.push(`<code>${escapeHtml(code)}</code>`);
        return `___INLINE_CODE_${index}___`;
    });
    
    // Step 3: Process headers (must be on their own line)
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Step 4: Process bold and italic
    // Bold: **text** or __text__
    html = html.replace(/\*\*([^\*\n]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_\n]+)__/g, '<strong>$1</strong>');
    
    // Italic: *text* or _text_ (but not inside words)
    html = html.replace(/(?<!\w)\*([^\*\n]+)\*(?!\w)/g, '<em>$1</em>');
    html = html.replace(/(?<!\w)_([^_\n]+)_(?!\w)/g, '<em>$1</em>');
    
    // Step 5: Process links [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Step 6: Process lists
    // Split into lines for list processing
    const lines = html.split('\n');
    const processedLines = [];
    let inList = false;
    let listType = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        // Check for unordered list (- or *)
        const unorderedMatch = trimmedLine.match(/^[-*]\s+(.+)$/);
        // Check for ordered list (1. , 2. , etc.)
        const orderedMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
        
        if (unorderedMatch) {
            if (!inList || listType !== 'ul') {
                if (inList) processedLines.push(`</${listType}>`);
                processedLines.push('<ul>');
                listType = 'ul';
                inList = true;
            }
            processedLines.push(`<li>${unorderedMatch[1]}</li>`);
        } else if (orderedMatch) {
            if (!inList || listType !== 'ol') {
                if (inList) processedLines.push(`</${listType}>`);
                processedLines.push('<ol>');
                listType = 'ol';
                inList = true;
            }
            processedLines.push(`<li>${orderedMatch[1]}</li>`);
        } else {
            if (inList) {
                processedLines.push(`</${listType}>`);
                inList = false;
                listType = null;
            }
            processedLines.push(line);
        }
    }
    
    // Close any open list
    if (inList) {
        processedLines.push(`</${listType}>`);
    }
    
    html = processedLines.join('\n');
    
    // Step 7: Process blockquotes (> text)
    html = html.replace(/^&gt;\s*(.+)$/gim, '<blockquote>$1</blockquote>');
    
    // Step 8: Process line breaks and paragraphs
    // Convert double newlines to paragraph breaks
    html = html.split('\n\n').map(para => {
        para = para.trim();
        // Don't wrap if already has block-level elements
        if (para.match(/^<(h[1-6]|ul|ol|pre|blockquote)/)) {
            return para;
        }
        return para ? `<p>${para.replace(/\n/g, '<br>')}</p>` : '';
    }).join('\n');
    
    // Step 9: Restore code blocks
    codeBlocks.forEach((block, index) => {
        html = html.replace(`___CODE_BLOCK_${index}___`, block);
    });
    
    // Step 10: Restore inline codes
    inlineCodes.forEach((code, index) => {
        html = html.replace(`___INLINE_CODE_${index}___`, code);
    });
    
    return html;
}

/**
 * Escape HTML để tránh XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showTypingIndicator() {
    const chatBody = document.getElementById('chatBody');
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message ai typing-indicator';
    typingDiv.id = 'typingIndicator';
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerHTML = '<span>●</span> <span>●</span> <span>●</span>';
    bubble.style.cssText = 'display: flex; gap: 4px; justify-content: center; width: 60px;';
    
    typingDiv.appendChild(bubble);
    chatBody.appendChild(typingDiv);
    
    chatBody.scrollTop = chatBody.scrollHeight;
    
    // Animate dots
    const dots = bubble.querySelectorAll('span');
    dots.forEach((dot, index) => {
        dot.style.animation = `bounce 1.4s infinite ${index * 0.2}s`;
    });
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// ===================================
// AI RESPONSE GENERATOR (GROQ CLOUD API)
// ===================================

// SYSTEM PROMPT - Chuyên gia về Tư tưởng Hồ Chí Minh
const SYSTEM_PROMPT = `Bạn là một trợ lý học thuật chuyên sâu về môn học **Tư Tưởng Hồ Chí Minh**.

Nhiệm vụ của bạn:
- Trả lời **chính xác, đầy đủ, có hệ thống** mọi câu hỏi liên quan đến môn Tư Tưởng Hồ Chí Minh.
- Đặc biệt, bạn phải trả lời **rất tốt, sâu sắc, đúng trọng tâm** về:
  1. **Tư tưởng Hồ Chí Minh về mối quan hệ giữa độc lập dân tộc và chủ nghĩa xã hội**
  2. **Vận dụng tư tưởng Hồ Chí Minh về độc lập dân tộc gắn liền với chủ nghĩa xã hội trong sự nghiệp cách mạng Việt Nam giai đoạn hiện nay**

Yêu cầu về nội dung:
- Dựa trên **quan điểm của Hồ Chí Minh**, **Văn kiện Đảng**, và **giáo trình chính thống**.
- Trình bày rõ:
  - Khái niệm
  - Nội dung cốt lõi
  - Ý nghĩa lý luận
  - Ý nghĩa thực tiễn
  - Liên hệ với bối cảnh Việt Nam hiện nay
- Khi cần, hãy chia ý theo **gạch đầu dòng**, **sơ đồ logic**, hoặc **mở–thân–kết** để dễ học và dễ ghi nhớ.

Yêu cầu về phong cách:
- Ngôn ngữ **chuẩn mực, học thuật**, phù hợp với bài thi, tiểu luận, thuyết trình đại học.
- Diễn đạt **dễ hiểu**, không lan man, không sáo rỗng.
- Có thể diễn giải lại theo cách **đơn giản hơn** nếu người dùng yêu cầu.

Yêu cầu bổ sung:
- Có khả năng hỗ trợ:
  - Viết **dàn ý**, **bài tự luận**, **slide thuyết trình**
  - So sánh – phân tích – liên hệ thực tiễn
  - Trả lời theo dạng **câu hỏi thi**
- Không bịa đặt thông tin lịch sử hay quan điểm chính trị.

Luôn đặt mục tiêu: **giúp người học hiểu đúng, nhớ lâu, và vận dụng tốt Tư tưởng Hồ Chí Minh**.`;

/**
 * Hàm gọi Groq Cloud API để sinh response từ AI
 * @param {string} userMessage - Câu hỏi của người dùng
 * @returns {Promise<string>} - Câu trả lời từ AI
 */
async function generateAIResponse(userMessage) {
    // ⚠️ QUAN TRỌNG: SETUP API KEY
    // 
    // CÁCH 1 (KHUYẾN NGHỊ): Dùng config.js
    // -------------------------------------
    // 1. Copy file config.example.js → config.js
    // 2. Paste API key vào config.js
    // 3. Thêm vào index.html: <script src="config.js"></script>
    // 4. config.js không bị push lên GitHub (có trong .gitignore)
    //
    // CÁCH 2: Paste trực tiếp (CHỈ CHO LOCAL)
    // -------------------------------------
    // Uncomment dòng dưới và paste API key:
    // const GROQ_API_KEY = 'gsk_xxxxxxxxxxxxx';
    //
    // ⚠️ NHỚ: Xóa API key trước khi push lên GitHub!
    
    let apiKey = 'YOUR_GROQ_API_KEY_HERE';
    
    // Thử đọc từ config.js nếu có
    if (typeof CONFIG !== 'undefined' && CONFIG.GROQ_API_KEY) {
        apiKey = CONFIG.GROQ_API_KEY;
    }
    
    // Kiểm tra API key đã được setup chưa
    if (apiKey === 'YOUR_GROQ_API_KEY_HERE') {
        return `❌ **Chưa Setup API Key**

Vui lòng setup API key theo 1 trong 2 cách:

**CÁCH 1: Dùng config.js (An toàn - Khuyến nghị)**
1. Copy file \`config.example.js\` thành \`config.js\`
2. Mở \`config.js\` và paste API key vào
3. Trong \`index.html\`, thêm dòng này TRƯỚC \`<script src="script.js">\`:
   \`\`\`html
   <script src="config.js"></script>
   \`\`\`
4. File \`config.js\` không bị push lên GitHub (đã có trong .gitignore)

**CÁCH 2: Paste trực tiếp (Chỉ cho testing local)**
1. Mở file \`script.js\`
2. Tìm dòng: \`let apiKey = 'YOUR_GROQ_API_KEY_HERE';\`
3. Thay bằng: \`let apiKey = 'gsk_xxxxxxxx';\`
4. ⚠️ **QUAN TRỌNG**: Xóa API key trước khi push lên GitHub!

Lấy API key tại: https://console.groq.com`;
    }
    
    // Đọc config (từ file hoặc default)
    const apiUrl = (typeof CONFIG !== 'undefined' && CONFIG.GROQ_API_URL) 
        ? CONFIG.GROQ_API_URL 
        : 'https://api.groq.com/openai/v1/chat/completions';
        
    const model = (typeof CONFIG !== 'undefined' && CONFIG.MODEL)
        ? CONFIG.MODEL
        : 'llama-3.3-70b-versatile';
        
    const temperature = (typeof CONFIG !== 'undefined' && CONFIG.TEMPERATURE)
        ? CONFIG.TEMPERATURE
        : 0.8;
        
    const maxTokens = (typeof CONFIG !== 'undefined' && CONFIG.MAX_TOKENS)
        ? CONFIG.MAX_TOKENS
        : 4096;
    
    try {
        console.log('🔄 Đang gọi Groq API...');
        console.log('📝 User message:', userMessage);
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: SYSTEM_PROMPT
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                temperature: temperature,
                max_tokens: maxTokens,
                top_p: 1,
                stream: false
            })
        });
        
        console.log('📡 Response status:', response.status);
        
        // Kiểm tra response status
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { error: 'Unknown error' };
            }
            
            console.error('❌ Groq API Error:', errorData);
            console.error('Status:', response.status);
            console.error('Status Text:', response.statusText);
            
            // Xử lý các loại lỗi khác nhau
            if (response.status === 401) {
                return '❌ **Lỗi xác thực API**\n\nAPI key không hợp lệ. Vui lòng kiểm tra:\n\n1. API key đã được paste đúng vào script.js (dòng 378)\n2. Không có khoảng trắng thừa\n3. Key bắt đầu bằng "gsk_"\n\n💡 Hướng dẫn lấy API key mới:\n- Vào https://console.groq.com\n- Tạo API key mới\n- Copy và paste vào script.js';
            } else if (response.status === 429) {
                return '⚠️ **Vượt quá giới hạn**\n\nBạn đã gửi quá nhiều request. Vui lòng:\n- Đợi 1-2 phút\n- Thử lại sau\n\n💡 Tip: Tránh spam nhiều tin nhắn liên tiếp.';
            } else if (response.status === 400) {
                return `❌ **Lỗi request không hợp lệ**\n\nChi tiết: ${errorData.error?.message || 'Unknown error'}\n\nCó thể do:\n- Model name không đúng\n- Request format sai\n- Token quá dài\n\n💡 Kiểm tra Console (F12) để xem chi tiết.`;
            } else {
                return `❌ **Lỗi từ Groq API**\n\nMã lỗi: ${response.status}\nChi tiết: ${errorData.error?.message || response.statusText}\n\n💡 Vui lòng thử lại sau hoặc kiểm tra https://status.groq.com`;
            }
        }
        
        const data = await response.json();
        console.log('✅ Response received:', data);
        
        // Kiểm tra xem có data không
        if (data.choices && data.choices.length > 0) {
            const aiMessage = data.choices[0].message.content;
            console.log('💬 AI response:', aiMessage.substring(0, 100) + '...');
            return aiMessage;
        } else {
            throw new Error('Không nhận được response từ AI');
        }
        
    } catch (error) {
        console.error('💥 Error calling Groq API:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        // Xử lý các loại lỗi
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return '🌐 **Lỗi kết nối**\n\nKhông thể kết nối với Groq API. Vui lòng:\n- Kiểm tra kết nối internet\n- Kiểm tra firewall/VPN\n- Thử lại sau';
        }
        
        if (error.message.includes('API key')) {
            return '🔑 **Lỗi API Key**\n\nVui lòng kiểm tra lại API key trong file script.js';
        }
        
        return `❌ **Đã xảy ra lỗi**\n\n${error.message}\n\n💡 Mở Console (F12) để xem chi tiết lỗi.`;
    }
}

/**
 * PHIÊN BẢN STREAMING (Tùy chọn nâng cao)
 * Nếu muốn hiển thị text từng chữ một như ChatGPT, dùng hàm này
 * Uncomment để sử dụng
 */
/*
async function generateAIResponseStreaming(userMessage, onChunk) {
    const GROQ_API_KEY = 'YOUR_GROQ_API_KEY_HERE';
    const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
    
    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-120b',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userMessage }
                ],
                temperature: 1,
                max_tokens: 8192,
                stream: true // Enable streaming
            })
        });
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const jsonStr = line.slice(6);
                    if (jsonStr === '[DONE]') continue;
                    
                    try {
                        const json = JSON.parse(jsonStr);
                        const content = json.choices[0]?.delta?.content || '';
                        if (content) {
                            fullText += content;
                            onChunk(content); // Callback để update UI
                        }
                    } catch (e) {
                        console.error('Parse error:', e);
                    }
                }
            }
        }
        
        return fullText;
        
    } catch (error) {
        console.error('Streaming error:', error);
        throw error;
    }
}
*/

// ===================================
// ADDITIONAL ANIMATIONS
// ===================================

// Add CSS for typing indicator animation
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 60%, 100% {
            transform: translateY(0);
        }
        30% {
            transform: translateY(-10px);
        }
    }
`;
document.head.appendChild(style);

// ===================================
// UTILITY FUNCTIONS
// ===================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Format date/time
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

// ===================================
// ACCESSIBILITY ENHANCEMENTS
// ===================================

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    // ESC to close chat
    if (e.key === 'Escape') {
        const chatWidget = document.getElementById('chatWidget');
        if (chatWidget.classList.contains('active')) {
            closeChat();
        }
    }
});

// ===================================
// PERFORMANCE MONITORING
// ===================================

// Log page load time
window.addEventListener('load', function() {
    const loadTime = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
    console.log(`Page loaded in ${loadTime}ms`);
});

// ===================================
// EXPORT FOR TESTING (if needed)
// ===================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateAIResponse,
        formatTimestamp
    };
}