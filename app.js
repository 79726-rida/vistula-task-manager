let config = null;
let editingTaskId = null;

const taskForm = document.getElementById("task-form");
const taskIdInput = document.getElementById("task-id");
const taskTitleInput = document.getElementById("task-title");
const taskDescriptionInput = document.getElementById("task-description");
const taskSubmitButton = document.getElementById("task-submit");
const taskCancelEditButton = document.getElementById("task-cancel-edit");
const taskList = document.getElementById("task-list");
const statusMessage = document.getElementById("status-message");
const taskItemTemplate = document.getElementById("task-item-template");

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "crimson" : "green";
}

function apiHeaders(extra = {}) {
  return {
    apikey: config.supabasePublishableKey,
    Authorization: `Bearer ${config.supabasePublishableKey}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

function apiUrl(path) {
  return `${config.supabaseUrl}/rest/v1/${config.tableName}${path}`;
}

async function loadConfig() {
  const response = await fetch("config.json");
  if (!response.ok) {
    throw new Error("Failed to load config.json");
  }
  config = await response.json();
}

async function fetchTasks() {
  const response = await fetch(apiUrl("?select=*&order=id.asc"), {
    headers: apiHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch tasks (status ${response.status})`);
  }
  return response.json();
}

async function createTask(task) {
  const response = await fetch(apiUrl(""), {
    method: "POST",
    headers: apiHeaders({ Prefer: "return=representation" }),
    body: JSON.stringify(task),
  });
  if (!response.ok) {
    throw new Error(`Failed to create task (status ${response.status})`);
  }
  return response.json();
}

async function updateTask(id, task) {
  const response = await fetch(apiUrl(`?id=eq.${id}`), {
    method: "PATCH",
    headers: apiHeaders({ Prefer: "return=representation" }),
    body: JSON.stringify(task),
  });
  if (!response.ok) {
    throw new Error(`Failed to update task (status ${response.status})`);
  }
  return response.json();
}

async function deleteTask(id) {
  const response = await fetch(apiUrl(`?id=eq.${id}`), {
    method: "DELETE",
    headers: apiHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to delete task (status ${response.status})`);
  }
}

function renderTasks(tasks) {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No tasks yet. Add one above.";
    taskList.appendChild(empty);
    return;
  }

  for (const task of tasks) {
    const node = taskItemTemplate.content.cloneNode(true);
    const item = node.querySelector(".task-item");
    item.dataset.id = task.id;

    node.querySelector(".task-title").textContent = task.title;
    node.querySelector(".task-description").textContent = task.description || "";
    node.querySelector(".task-status").textContent = task.completed
      ? "Completed"
      : "Incomplete";

    const toggleButton = node.querySelector(".toggle-task");
    toggleButton.textContent = task.completed
      ? "Mark Incomplete"
      : "Mark Complete";
    toggleButton.addEventListener("click", () => handleToggleTask(task));

    node.querySelector(".edit-task").addEventListener("click", () => {
      startEditingTask(task);
    });

    node.querySelector(".delete-task").addEventListener("click", () => {
      handleDeleteTask(task.id);
    });

    taskList.appendChild(node);
  }
}

async function refreshTasks() {
  try {
    const tasks = await fetchTasks();
    renderTasks(tasks);
  } catch (error) {
    showStatus(error.message, true);
  }
}

function startEditingTask(task) {
  editingTaskId = task.id;
  taskIdInput.value = task.id;
  taskTitleInput.value = task.title;
  taskDescriptionInput.value = task.description || "";
  taskSubmitButton.textContent = "Save Changes";
  taskCancelEditButton.hidden = false;
  taskTitleInput.focus();
}

function stopEditingTask() {
  editingTaskId = null;
  taskIdInput.value = "";
  taskForm.reset();
  taskSubmitButton.textContent = "Add Task";
  taskCancelEditButton.hidden = true;
}

async function handleToggleTask(task) {
  try {
    await updateTask(task.id, { completed: !task.completed });
    showStatus("Task updated.");
    await refreshTasks();
  } catch (error) {
    showStatus(error.message, true);
  }
}

async function handleDeleteTask(id) {
  try {
    await deleteTask(id);
    showStatus("Task deleted.");
    await refreshTasks();
  } catch (error) {
    showStatus(error.message, true);
  }
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const title = taskTitleInput.value.trim();
  const description = taskDescriptionInput.value.trim();

  if (!title) {
    showStatus("Title is required.", true);
    return;
  }

  try {
    if (editingTaskId) {
      await updateTask(editingTaskId, { title, description });
      showStatus("Task updated.");
    } else {
      await createTask({ title, description, completed: false });
      showStatus("Task added.");
    }
    stopEditingTask();
    await refreshTasks();
  } catch (error) {
    showStatus(error.message, true);
  }
}

taskForm.addEventListener("submit", handleFormSubmit);
taskCancelEditButton.addEventListener("click", stopEditingTask);

async function init() {
  try {
    await loadConfig();
    await refreshTasks();
  } catch (error) {
    showStatus(error.message, true);
  }
}

init();
