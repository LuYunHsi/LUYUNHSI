const taskInput = document.getElementById('taskInput');
const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const themeToggle = document.getElementById('themeToggle');
const STORAGE_KEY = 'pure-frontend-task-app';

let tasks = [];

function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    tasks = JSON.parse(saved);
  } catch (error) {
    tasks = [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function updateTaskCount() {
  const count = tasks.length;
  taskCount.textContent = `${count} 個任務`;
}

function createTaskElement(task) {
  const item = document.createElement('li');
  item.className = 'task-item';
  item.dataset.id = task.id;

  const text = document.createElement('p');
  text.className = 'task-item__text';
  text.textContent = task.text;
  if (task.done) {
    text.classList.add('task-item__done');
  }

  const actions = document.createElement('div');
  actions.className = 'task-item__actions';

  const toggleButton = document.createElement('button');
  toggleButton.type = 'button';
  toggleButton.className = 'task-button';
  toggleButton.textContent = task.done ? '還原' : '完成';
  toggleButton.addEventListener('click', () => toggleTaskDone(task.id));

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'task-button';
  deleteButton.textContent = '刪除';
  deleteButton.addEventListener('click', () => removeTask(task.id));

  actions.append(toggleButton, deleteButton);
  item.append(text, actions);

  return item;
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task) => {
    taskList.appendChild(createTaskElement(task));
  });
  updateTaskCount();
}

function addTask(text) {
  tasks.unshift({
    id: Date.now().toString(),
    text: text.trim(),
    done: false,
  });
  saveTasks();
  renderTasks();
}

function toggleTaskDone(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, done: !task.done } : task
  );
  saveTasks();
  renderTasks();
}

function removeTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

function initTheme() {
  const savedTheme = localStorage.getItem('pure-frontend-theme');
  const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
  themeToggle.textContent = isDark ? '☀️' : '🌙';
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('pure-frontend-theme', isDark ? 'dark' : 'light');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
}

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = taskInput.value.trim();
  if (!value) return;
  addTask(value);
  taskInput.value = '';
  taskInput.focus();
});

themeToggle.addEventListener('click', toggleTheme);

loadTasks();
initTheme();
renderTasks();
