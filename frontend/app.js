// backend/frontend/app.js

// --- STYLES (Injected dynamically) ---
const styles = `
:root {
  --primary: #6366f1;
  --primary-hover: #4f46e5;
  --secondary: #ec4899;
  --background: #0f172a;
  --surface: #1e293b;
  --text: #f8fafc;
  --text-muted: #94a3b8;
  --border: #334155;
  --glass: rgba(30, 41, 59, 0.7);
  --glass-border: rgba(255, 255, 255, 0.1);
  --success: #10b981;
  --error: #ef4444;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Outfit', sans-serif;
  background-color: var(--background);
  color: var(--text);
  min-height: 100vh;
  background-image: 
    radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(236, 72, 153, 0.15) 0px, transparent 50%);
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
}

ul { list-style: none; }
a { text-decoration: none; color: inherit; }

/* Components */
.container { max-width: 1200px; margin: 0 auto; padding: 2rem; width: 100%; }
.text-center { text-align: center; }
.mt-4 { margin-top: 1rem; }
.mb-4 { margin-bottom: 1rem; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.gap-4 { gap: 1rem; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.hidden { display: none !important; }

.card {
  background: var(--glass);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-family: inherit;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary), #818cf8);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.3);
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 8px -1px rgba(99, 102, 241, 0.4); }

.btn-secondary { background: var(--surface); color: var(--text); border: 1px solid var(--border); }
.btn-secondary:hover { background: var(--border); }

input, select {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  color: var(--text);
  font-family: inherit;
  margin-top: 0.5rem;
}
input:focus, select:focus { outline: none; border-color: var(--primary); }
label { color: var(--text-muted); font-size: 0.9rem; font-weight: 500; }

/* Auth */
.auth-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.auth-box { width: 100%; max-width: 400px; }

/* Dashboard */
.nav-bar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 2rem; background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(8px); border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 10;
}
.logo { font-size: 1.5rem; font-weight: 700; background: linear-gradient(to right, #818cf8, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

.tab-nav { display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
.tab-btn { background: none; border: none; color: var(--text-muted); font-size: 1rem; font-weight: 600; padding: 0.5rem 1rem; cursor: pointer; position: relative; }
.tab-btn.active { color: var(--primary); }
.tab-btn.active::after { content: ''; position: absolute; bottom: -0.6rem; left: 0; width: 100%; height: 2px; background: var(--primary); }

.question-item {
  background: rgba(30, 41, 59, 0.4); border: 1px solid var(--border);
  border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;
  display: flex; justify-content: space-between; align-items: start;
}
.badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
.badge-easy { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.3); }
.badge-medium { background: rgba(245, 158, 11, 0.2); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.3); }
.badge-hard { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); }

.paper-preview { background: #fff; color: #000; padding: 3rem; border-radius: 0.5rem; margin-top: 2rem; }
.paper-header { text-align: center; margin-bottom: 2rem; border-bottom: 2px solid #000; padding-bottom: 1rem; }
.paper-question { margin-bottom: 1.5rem; page-break-inside: avoid; }
`;

// Inject Styles
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);


// --- STATE & API ---
const API_BASE = '/api';
const state = {
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user')),
    questions: [],
    topics: new Set()
};

const api = async (endpoint, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...(state.token ? { 'Authorization': `Bearer ${state.token}` } : {})
    };
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
        const data = await res.json();
        if (!res.ok) {
            if (res.status === 401) logout();
            throw new Error(data.message || 'Something went wrong');
        }
        return data;
    } catch (err) {
        alert(err.message);
        throw err;
    }
};

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    state.token = null;
    state.user = null;
    renderApp();
};


// --- VIEWS ---

function renderApp() {
    const app = document.getElementById('app');
    app.innerHTML = ''; // Clear

    if (!state.token) {
        renderAuth(app);
    } else {
        renderDashboard(app);
    }
}

function renderAuth(container) {
    container.innerHTML = `
        <div class="auth-container">
            <div class="card auth-box" id="loginBox">
                <h2 class="text-center mb-4" style="font-size: 1.8rem; background: linear-gradient(to right, #818cf8, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Welcome</h2>
                <form id="loginForm">
                    <div class="mb-4">
                        <label>Email</label>
                        <input type="email" id="loginEmail" placeholder="admin@example.com" required>
                    </div>
                    <div class="mb-4">
                        <label>Password</label>
                        <input type="password" id="loginPassword" placeholder="••••••••" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%">Sign In</button>
                </form>
                <p class="text-center mt-4" style="font-size: 0.9rem">
                    Don't have an account? <a href="#" id="toReg" style="color: var(--primary)">Register</a>
                </p>
            </div>

            <div class="card auth-box hidden" id="registerBox">
                <h2 class="text-center mb-4">Create Account</h2>
                <form id="registerForm">
                    <div class="mb-4"><label>Full Name</label><input type="text" id="regName" required></div>
                    <div class="mb-4"><label>Email</label><input type="email" id="regEmail" required></div>
                    <div class="mb-4"><label>Password</label><input type="password" id="regPassword" required></div>
                    <div class="mb-4">
                        <label>Role</label>
                        <select id="regRole">
                            <option value="admin">Admin</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%">Create Account</button>
                </form>
                <p class="text-center mt-4" style="font-size: 0.9rem">
                    Already have an account? <a href="#" id="toLogin" style="color: var(--primary)">Login</a>
                </p>
            </div>
        </div>
    `;

    // Auth Events
    setTimeout(() => {
        document.getElementById('toReg').onclick = (e) => {
            e.preventDefault();
            document.getElementById('loginBox').classList.add('hidden');
            document.getElementById('registerBox').classList.remove('hidden');
        };
        document.getElementById('toLogin').onclick = (e) => {
            e.preventDefault();
            document.getElementById('registerBox').classList.add('hidden');
            document.getElementById('loginBox').classList.remove('hidden');
        };

        document.getElementById('loginForm').onsubmit = async (e) => {
            e.preventDefault();
            try {
                const res = await api('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({
                        email: document.getElementById('loginEmail').value,
                        password: document.getElementById('loginPassword').value
                    })
                });
                localStorage.setItem('token', res.token);
                localStorage.setItem('user', JSON.stringify(res.user));
                state.token = res.token;
                state.user = res.user;
                renderApp();
            } catch (err) { console.error(err); }
        };

        document.getElementById('registerForm').onsubmit = async (e) => {
            e.preventDefault();
            try {
                await api('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: document.getElementById('regName').value,
                        email: document.getElementById('regEmail').value,
                        password: document.getElementById('regPassword').value,
                        role: document.getElementById('regRole').value
                    })
                });
                alert('Registration successful! Please login.');
                document.getElementById('registerBox').classList.add('hidden');
                document.getElementById('loginBox').classList.remove('hidden');
            } catch (err) { console.error(err); }
        };
    }, 0);
}

function renderDashboard(container) {
    container.innerHTML = `
        <nav class="nav-bar">
            <div class="logo"><i class="fas fa-file-alt"></i> PaperGen</div>
            <div class="flex items-center gap-4">
                <span>${state.user?.name}</span>
                <button id="logoutBtn" class="btn btn-secondary" style="padding: 0.5rem 1rem"><i class="fas fa-sign-out-alt"></i></button>
            </div>
        </nav>
        
        <div class="container">
            <div class="tab-nav">
                <button class="tab-btn active" onclick="switchTab('questions')">Question Bank</button>
                <button class="tab-btn" onclick="switchTab('generate')">Generate Paper</button>
            </div>

            <div id="questionsTab">
                <div class="card mb-4">
                    <h3>Add Question</h3>
                    <form id="addQForm" class="mt-4 flex gap-4" style="flex-wrap: wrap; align-items: flex-end">
                        <div style="flex: 2; min-width: 250px"><label>Question</label><input id="qText" required placeholder="Question text..."></div>
                        <div style="flex: 1; min-width: 150px"><label>Topic</label><input id="qTopic" required placeholder="Topic"></div>
                        <div style="flex: 1; min-width: 120px">
                            <label>Difficulty</label>
                            <select id="qDiff"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>
                        </div>
                        <div style="width: 100px"><label>Marks</label><input type="number" id="qMarks" value="5" required></div>
                        <button class="btn btn-primary">Add</button>
                    </form>
                </div>
                <div class="flex justify-between items-center mb-4">
                    <h2>Questions</h2>
                    <select id="filterTopic" onchange="filterQuestions(this.value)" style="width: 150px; margin:0"></select>
                </div>
                <div id="qList"></div>
            </div>

            <div id="generateTab" class="hidden">
                 <div class="card" style="max-width: 800px; margin: 0 auto">
                    <h2 class="text-center mb-4">Generate Paper</h2>
                    <form id="genForm">
                        <div class="mb-4"><label>Total Marks</label><input type="number" id="totalMarks" value="50" required></div>
                        <div class="flex gap-4 mb-4">
                            <div style="flex:1"><label>Easy %</label><input type="number" id="pEasy" value="30"></div>
                            <div style="flex:1"><label>Medium %</label><input type="number" id="pMedium" value="50"></div>
                            <div style="flex:1"><label>Hard %</label><input type="number" id="pHard" value="20"></div>
                        </div>
                        <button class="btn btn-primary" style="width: 100%">Generate</button>
                    </form>
                 </div>
                 <div id="paperResult" class="hidden"></div>
            </div>
        </div>
    `;

    // Events & Init
    setTimeout(() => {
        document.getElementById('logoutBtn').onclick = logout;
        document.getElementById('addQForm').onsubmit = handleAddQuestion;
        document.getElementById('genForm').onsubmit = handleGenerate;
        loadQuestions();
    }, 0);
}

// --- DASHBOARD HELPERS ---

window.switchTab = (tab) => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.textContent.toLowerCase().includes(tab)));
    document.getElementById('questionsTab').classList.toggle('hidden', tab !== 'questions');
    document.getElementById('generateTab').classList.toggle('hidden', tab !== 'generate');
};

async function loadQuestions() {
    const list = document.getElementById('qList');
    if (!list) return;
    list.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin"></i></div>';

    try {
        state.questions = await api('/questions');
        // Update Filter
        state.questions.forEach(q => state.topics.add(q.topic));
        const filter = document.getElementById('filterTopic');
        if (filter) {
            filter.innerHTML = '<option value="">All Topics</option>' +
                Array.from(state.topics).map(t => `<option value="${t}">${t}</option>`).join('');
        }
        renderQList(state.questions);
    } catch (e) { console.error(e); }
}

function renderQList(arr) {
    const list = document.getElementById('qList');
    if (!list) return;
    if (arr.length === 0) { list.innerHTML = '<p class="text-center text-muted">No questions.</p>'; return; }
    list.innerHTML = arr.map(q => `
        <div class="question-item">
            <div>
                <h4>${q.question_text}</h4>
                <div class="flex gap-4 text-muted" style="font-size: 0.9rem; margin-top: 0.5rem">
                    <span><i class="fas fa-tag"></i> ${q.topic}</span>
                    <span><i class="fas fa-star"></i> ${q.marks} Marks</span>
                </div>
            </div>
            <span class="badge badge-${q.difficulty}">${q.difficulty}</span>
        </div>
    `).join('');
}

window.filterQuestions = (val) => {
    renderQList(val ? state.questions.filter(q => q.topic === val) : state.questions);
};

async function handleAddQuestion(e) {
    e.preventDefault();
    try {
        await api('/questions', {
            method: 'POST',
            body: JSON.stringify({
                question_text: document.getElementById('qText').value,
                topic: document.getElementById('qTopic').value,
                difficulty: document.getElementById('qDiff').value,
                marks: parseInt(document.getElementById('qMarks').value)
            })
        });
        e.target.reset();
        loadQuestions();
    } catch (err) { console.error(err); }
}

async function handleGenerate(e) {
    e.preventDefault();
    try {
        const res = await api('/papers/generate', {
            method: 'POST',
            body: JSON.stringify({
                totalMarks: parseInt(document.getElementById('totalMarks').value),
                difficultyDistribution: {
                    easy: parseInt(document.getElementById('pEasy').value) / 100,
                    medium: parseInt(document.getElementById('pMedium').value) / 100,
                    hard: parseInt(document.getElementById('pHard').value) / 100
                }
            })
        });

        const result = document.getElementById('paperResult');
        result.classList.remove('hidden');
        result.innerHTML = `
            <div class="paper-preview" id="printArea">
                <div class="paper-header">
                    <h1>Final Examination</h1>
                    <p>Total Marks: ${res.totalMarksSelected} | Duration: 2 Hours</p>
                </div>
                ${res.questions.map((q, i) => `
                    <div class="paper-question flex justify-between">
                        <strong>Q${i + 1}. ${q.question_text}</strong>
                        <span>[${q.marks}]</span>
                    </div>
                `).join('')}
            </div>
            <div class="text-center mt-4">
                <button onclick="window.print()" class="btn btn-secondary">Print</button>
            </div>
        `;
        result.scrollIntoView({ behavior: 'smooth' });
    } catch (err) { console.error(err); }
}

// Start
renderApp();
