// ============ Constants ============
const STORAGE_KEY = 'vocabulary-app-data';
const API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/english/';

// ============ DOM Elements ============
const navStudyBtn = document.getElementById('navStudy');
const navManageBtn = document.getElementById('navManage');
const studyPage = document.getElementById('studyPage');
const managePage = document.getElementById('managePage');
const flashcard = document.getElementById('flashcard');
const vocabularySelect = document.getElementById('vocabularySelect');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const currentIndexSpan = document.getElementById('currentIndex');
const totalCountSpan = document.getElementById('totalCount');
const cardWord = document.getElementById('cardWord');
const cardTranslation = document.getElementById('cardTranslation');
const cardPOS = document.getElementById('cardPOS');
const cardExample = document.getElementById('cardExample');
const cardEtymology = document.getElementById('cardEtymology');
const addWordForm = document.getElementById('addWordForm');
const wordInput = document.getElementById('wordInput');
const translationInput = document.getElementById('translationInput');
const posInput = document.getElementById('posInput');
const exampleInput = document.getElementById('exampleInput');
const etymologyInput = document.getElementById('etymologyInput');
const autoFillBtn = document.getElementById('autoFillBtn');
const wordList = document.getElementById('wordList');
const wordCount = document.getElementById('wordCount');
const loadingIndicator = document.getElementById('loadingIndicator');

// ============ State ============
let vocabularies = {};
let currentVocabulary = null;
let currentWordIndex = 0;
let isFlipped = false;

// ============ Initialization ============
function init() {
  loadData();
  setupEventListeners();
  renderVocabularySelect();
  if (Object.keys(vocabularies).length > 0) {
    const firstVocabKey = Object.keys(vocabularies)[0];
    currentVocabulary = firstVocabKey;
    vocabularySelect.value = firstVocabKey;
    renderStudyPage();
  }
}

// ============ Event Listeners ============
function setupEventListeners() {
  // Navigation
  navStudyBtn.addEventListener('click', switchToStudy);
  navManageBtn.addEventListener('click', switchToManage);

  // Study Page
  flashcard.addEventListener('click', toggleFlip);
  prevBtn.addEventListener('click', prevWord);
  nextBtn.addEventListener('click', nextWord);
  vocabularySelect.addEventListener('change', changeVocabulary);

  // Manage Page
  addWordForm.addEventListener('submit', handleAddWord);
  autoFillBtn.addEventListener('click', handleAutoFill);
}

// ============ Navigation ============
function switchToStudy() {
  studyPage.classList.add('active');
  managePage.classList.remove('active');
  navStudyBtn.classList.add('active');
  navManageBtn.classList.remove('active');
}

function switchToManage() {
  studyPage.classList.remove('active');
  managePage.classList.add('active');
  navStudyBtn.classList.remove('active');
  navManageBtn.classList.add('active');
  renderWordList();
}

// ============ Study Page ============
function renderStudyPage() {
  if (!currentVocabulary || !vocabularies[currentVocabulary]) {
    cardWord.textContent = '無';
    cardTranslation.textContent = '-';
    cardPOS.textContent = '-';
    cardExample.textContent = '-';
    cardEtymology.textContent = '-';
    currentIndexSpan.textContent = '0';
    totalCountSpan.textContent = '0';
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    return;
  }

  const words = vocabularies[currentVocabulary];
  if (words.length === 0) {
    totalCountSpan.textContent = '0';
    return;
  }

  const word = words[currentWordIndex];
  cardWord.textContent = word.word;
  cardTranslation.textContent = word.translation || '-';
  cardPOS.textContent = word.pos || '-';
  cardExample.textContent = word.example || '-';
  cardEtymology.textContent = word.etymology || '-';
  currentIndexSpan.textContent = currentWordIndex + 1;
  totalCountSpan.textContent = words.length;

  prevBtn.disabled = currentWordIndex === 0;
  nextBtn.disabled = currentWordIndex === words.length - 1;

  isFlipped = false;
  flashcard.classList.remove('flipped');
}

function toggleFlip() {
  flashcard.classList.toggle('flipped');
  isFlipped = !isFlipped;
}

function prevWord() {
  if (currentWordIndex > 0) {
    currentWordIndex--;
    renderStudyPage();
  }
}

function nextWord() {
  const words = vocabularies[currentVocabulary];
  if (currentWordIndex < words.length - 1) {
    currentWordIndex++;
    renderStudyPage();
  }
}

function changeVocabulary(e) {
  currentVocabulary = e.target.value;
  currentWordIndex = 0;
  renderStudyPage();
}

// ============ Manage Page ============
function renderVocabularySelect() {
  vocabularySelect.innerHTML = '<option value="">選擇單字庫...</option>';
  Object.keys(vocabularies).forEach((vocabName) => {
    const option = document.createElement('option');
    option.value = vocabName;
    option.textContent = `${vocabName} (${vocabularies[vocabName].length} 個)`;
    vocabularySelect.appendChild(option);
  });
}

function renderWordList() {
  if (!currentVocabulary || !vocabularies[currentVocabulary]) {
    wordList.innerHTML = '<p style="text-align: center; color: var(--text-muted);">無單字庫</p>';
    wordCount.textContent = '0';
    return;
  }

  const words = vocabularies[currentVocabulary];
  wordCount.textContent = words.length;
  wordList.innerHTML = '';

  words.forEach((word, index) => {
    const item = document.createElement('div');
    item.className = 'word-item';
    item.innerHTML = `
      <div class="word-info">
        <div class="word-main">${escapeHtml(word.word)}</div>
        <div class="word-detail">
          <strong>翻譯：</strong> ${escapeHtml(word.translation || '-')} <br/>
          <strong>詞性：</strong> ${escapeHtml(word.pos || '-')} <br/>
          <strong>例句：</strong> ${escapeHtml(word.example || '-')} <br/>
          <strong>字根：</strong> ${escapeHtml(word.etymology || '-')}
        </div>
      </div>
      <div class="word-actions">
        <button class="delete-btn" onclick="deleteWord('${escapeHtml(word.word)}')">刪除</button>
      </div>
    `;
    wordList.appendChild(item);
  });
}

function handleAddWord(e) {
  e.preventDefault();

  const word = wordInput.value.trim().toLowerCase();
  const translation = translationInput.value.trim();
  const pos = posInput.value.trim();
  const example = exampleInput.value.trim();
  const etymology = etymologyInput.value.trim();

  if (!word || !translation) {
    alert('請填入單字和翻譯');
    return;
  }

  if (!currentVocabulary) {
    const vocabName = prompt('請輸入單字庫名稱：');
    if (!vocabName) return;
    currentVocabulary = vocabName;
    vocabularies[vocabName] = [];
    renderVocabularySelect();
    vocabularySelect.value = vocabName;
  }

  // Check if word already exists
  const existingIndex = vocabularies[currentVocabulary].findIndex(
    (w) => w.word.toLowerCase() === word
  );

  if (existingIndex >= 0) {
    if (confirm('此單字已存在，是否更新？')) {
      vocabularies[currentVocabulary][existingIndex] = {
        word,
        translation,
        pos,
        example,
        etymology,
      };
    } else {
      return;
    }
  } else {
    vocabularies[currentVocabulary].push({
      word,
      translation,
      pos,
      example,
      etymology,
    });
  }

  saveData();
  resetForm();
  renderVocabularySelect();
  renderWordList();
  renderStudyPage();
  alert('已新增/更新單字');
}

function deleteWord(word) {
  if (confirm('確定要刪除此單字嗎？')) {
    vocabularies[currentVocabulary] = vocabularies[currentVocabulary].filter(
      (w) => w.word !== word
    );
    saveData();
    renderVocabularySelect();
    renderWordList();
    renderStudyPage();
  }
}

function resetForm() {
  addWordForm.reset();
  wordInput.focus();
}

// ============ Auto Fill API ============
async function handleAutoFill() {
  const word = wordInput.value.trim().toLowerCase();

  if (!word) {
    alert('請先輸入英文單字');
    return;
  }

  autoFillBtn.disabled = true;
  loadingIndicator.classList.add('show');

  try {
    const response = await fetch(`${API_URL}${word}`);

    if (!response.ok) {
      throw new Error('查無此單字');
    }

    const data = await response.json();
    const entry = data[0];

    // Extract translation (using first definition)
    const definitions = entry.meanings[0]?.definitions || [];
    const translation = definitions[0]?.definition || '';

    // Extract POS (part of speech)
    const pos = entry.meanings.map((m) => m.partOfSpeech).join(', ') || '';

    // Extract example
    const example = definitions[0]?.example || '';

    // Extract etymology (if available)
    const etymology = entry.origin || '';

    // Fill in the form
    translationInput.value = translation;
    posInput.value = pos;
    exampleInput.value = example;
    etymologyInput.value = etymology;

    console.log('自動填入成功:', { translation, pos, example, etymology });
  } catch (error) {
    console.error('API Error:', error);
    alert(`自動填入失敗: ${error.message}`);
  } finally {
    autoFillBtn.disabled = false;
    loadingIndicator.classList.remove('show');
  }
}

// ============ Storage ============
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vocabularies));
}

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      vocabularies = JSON.parse(saved);
    } catch (error) {
      console.error('無法載入資料:', error);
      vocabularies = {};
    }
  } else {
    // Create sample data
    vocabularies = {
      '基礎詞彙': [
        {
          word: 'apple',
          translation: '蘋果',
          pos: 'noun',
          example: 'I eat an apple every day.',
          etymology: 'From Old English æpple',
        },
        {
          word: 'beautiful',
          translation: '美麗的',
          pos: 'adjective',
          example: 'This flower is beautiful.',
          etymology: 'From Old French bel',
        },
        {
          word: 'run',
          translation: '跑步',
          pos: 'verb',
          example: 'She runs in the morning.',
          etymology: 'From Old English rinnan',
        },
      ],
    };
    saveData();
  }
}

// ============ Utility ============
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// ============ Start App ============
init();
