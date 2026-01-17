// ===================================
// GLOBAL VARIABLES & STATE
// ===================================
let chatMessages = [];
let isTyping = false;

// ===================================
// DETECT ENVIRONMENT
// ===================================
const IS_PRODUCTION = window.location.hostname !== 'localhost' && 
                      window.location.hostname !== '127.0.0.1' &&
                      !window.location.hostname.includes('file://');

console.log('🌍 Environment:', IS_PRODUCTION ? 'PRODUCTION' : 'LOCAL DEVELOPMENT');

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
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const offset = navbarHeight + headerHeight + 20;
                    
                    const targetPosition = targetElement.offsetTop - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
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
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > lastScroll && currentScroll > 200) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
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
    
    if (chatClose) {
        chatClose.addEventListener('click', function() {
            closeChat();
        });
    }
    
    if (chatSend) {
        chatSend.addEventListener('click', function() {
            sendMessage();
        });
    }
    
    if (chatInput) {
        chatInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }
    
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
    
    addMessageToChat(message, 'user');
    
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    isTyping = true;
    showTypingIndicator();
    
    try {
        const aiResponse = await generateAIResponse(message);
        removeTypingIndicator();
        addMessageToChat(aiResponse, 'ai');
    } catch (error) {
        removeTypingIndicator();
        console.error('Error getting AI response:', error);
        addMessageToChat(
            'Xin lỗi, đã xảy ra lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.',
            'ai'
        );
    } finally {
        isTyping = false;
    }
}

function addMessageToChat(message, sender) {
    const chatBody = document.getElementById('chatBody');
    
    const welcomeMsg = chatBody.querySelector('.chat-welcome');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    if (sender === 'ai') {
        bubble.innerHTML = renderMarkdown(message);
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.title = 'Copy response';
        copyBtn.onclick = function() {
            copyToClipboard(message, copyBtn);
        };
        bubble.appendChild(copyBtn);
    } else {
        bubble.textContent = message;
    }
    
    messageDiv.appendChild(bubble);
    chatBody.appendChild(messageDiv);
    
    setTimeout(() => {
        chatBody.scrollTo({
            top: chatBody.scrollHeight,
            behavior: 'smooth'
        });
    }, 100);
    
    chatMessages.push({ message, sender, timestamp: Date.now() });
}

function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Copy failed:', err);
        button.innerHTML = '<i class="fas fa-times"></i>';
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
    });
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
// AI RESPONSE GENERATOR (DUAL MODE)
// ===================================

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

async function generateAIResponse(userMessage) {
    if (IS_PRODUCTION) {
        // ===================================
        // PRODUCTION MODE (Vercel)
        // ===================================
        return await generateAIResponseProduction(userMessage);
    } else {
        // ===================================
        // LOCAL DEVELOPMENT MODE
        // ===================================
        return await generateAIResponseLocal(userMessage);
    }
}

/**
 * Production mode - Gọi backend API trên Vercel
 */
async function generateAIResponseProduction(userMessage) {
    const API_ENDPOINT = '/api/chat';
    
    try {
        console.log('🔄 [PRODUCTION] Calling backend API...');
        
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.8,
                max_tokens: 4096
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            
            if (response.status === 401) {
                return '❌ Lỗi xác thực API key. Vui lòng liên hệ admin.';
            } else if (response.status === 429) {
                return '⚠️ Quá nhiều request. Vui lòng đợi 1 phút.';
            }
            return `❌ Lỗi: ${errorData.error?.message || 'Unknown error'}`;
        }
        
        const data = await response.json();
        
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        }
        
        throw new Error('No response from AI');
        
    } catch (error) {
        console.error('Error:', error);
        return '❌ Lỗi kết nối backend. Vui lòng thử lại.';
    }
}

/**
 * Local development mode - Gọi trực tiếp Groq API với config.js
 */
async function generateAIResponseLocal(userMessage) {
    let apiKey = 'YOUR_GROQ_API_KEY_HERE';
    
    // Thử đọc từ config.js
    if (typeof CONFIG !== 'undefined' && CONFIG.GROQ_API_KEY) {
        apiKey = CONFIG.GROQ_API_KEY;
    }
    
    // Check API key
    if (apiKey === 'YOUR_GROQ_API_KEY_HERE') {
        return `❌ **[LOCAL MODE] Chưa Setup API Key**

Bạn đang chạy ở chế độ LOCAL DEVELOPMENT.

Để test local, cần setup API key:

**CÁCH 1: Dùng config.js (Khuyến nghị)**
1. Copy file \`config.example.js\` thành \`config.js\`
2. Mở \`config.js\` và paste API key vào
3. Trong \`index.html\`, thêm: \`<script src="config.js"></script>\`
4. Refresh lại trang

**CÁCH 2: Deploy lên Vercel**
Deploy website lên Vercel thì không cần config.js nữa!
Xem hướng dẫn trong VERCEL_DEPLOY_GUIDE.md

Lấy API key tại: https://console.groq.com`;
    }
    
    try {
        console.log('🔄 [LOCAL] Calling Groq API directly...');
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.8,
                max_tokens: 4096,
                top_p: 1,
                stream: false
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Groq API Error:', errorData);
            
            if (response.status === 401) {
                return '❌ API key không hợp lệ. Vui lòng kiểm tra lại config.js';
            } else if (response.status === 429) {
                return '⚠️ Quá nhiều request. Vui lòng đợi 1-2 phút.';
            }
            return `❌ Lỗi: ${errorData.error?.message || 'Unknown'}`;
        }
        
        const data = await response.json();
        
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        }
        
        throw new Error('No response from AI');
        
    } catch (error) {
        console.error('Error:', error);
        
        if (error.message.includes('fetch')) {
            return '🌐 Lỗi kết nối. Kiểm tra internet và thử lại.';
        }
        
        return `❌ Lỗi: ${error.message}`;
    }
}

// ===================================
// MARKDOWN RENDERER
// ===================================

function renderMarkdown(text) {
    if (!text) return '';
    
    let html = text;
    
    const codeBlocks = [];
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, lang, code) {
        const index = codeBlocks.length;
        codeBlocks.push(`<pre><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`);
        return `___CODE_BLOCK_${index}___`;
    });
    
    const inlineCodes = [];
    html = html.replace(/`([^`]+)`/g, function(match, code) {
        const index = inlineCodes.length;
        inlineCodes.push(`<code>${escapeHtml(code)}</code>`);
        return `___INLINE_CODE_${index}___`;
    });
    
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    html = html.replace(/\*\*([^\*\n]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_\n]+)__/g, '<strong>$1</strong>');
    
    html = html.replace(/(?<!\w)\*([^\*\n]+)\*(?!\w)/g, '<em>$1</em>');
    html = html.replace(/(?<!\w)_([^_\n]+)_(?!\w)/g, '<em>$1</em>');
    
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    const lines = html.split('\n');
    const processedLines = [];
    let inList = false;
    let listType = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        const unorderedMatch = trimmedLine.match(/^[-*]\s+(.+)$/);
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
    
    if (inList) {
        processedLines.push(`</${listType}>`);
    }
    
    html = processedLines.join('\n');
    
    html = html.replace(/^&gt;\s*(.+)$/gim, '<blockquote>$1</blockquote>');
    
    html = html.split('\n\n').map(para => {
        para = para.trim();
        if (para.match(/^<(h[1-6]|ul|ol|pre|blockquote)/)) {
            return para;
        }
        return para ? `<p>${para.replace(/\n/g, '<br>')}</p>` : '';
    }).join('\n');
    
    codeBlocks.forEach((block, index) => {
        html = html.replace(`___CODE_BLOCK_${index}___`, block);
    });
    
    inlineCodes.forEach((code, index) => {
        html = html.replace(`___INLINE_CODE_${index}___`, code);
    });
    
    return html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===================================
// ADDITIONAL ANIMATIONS
// ===================================

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

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

// ===================================
// ACCESSIBILITY ENHANCEMENTS
// ===================================

document.addEventListener('keydown', function(e) {
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

window.addEventListener('load', function() {
    const loadTime = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
    console.log(`Page loaded in ${loadTime}ms`);
});

// ===================================
// EXPORT FOR TESTING
// ===================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateAIResponse,
        formatTimestamp
    };
}