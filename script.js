const taskBtn = document.querySelector("#taskBtn");
const taskList = document.querySelector("#taskList");
const taskInput = document.querySelector("#taskInput");
const clearAllBtn = document.querySelector("#clearAllBtn");
const clearCompletedBtn = document.querySelector("#clearCompletedBtn");

// Variáveis para o modal de edição
let currentEditingLi = null;
let currentEditingSpan = null;

// Criar modal de edição
function createEditModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'editModal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>✏️ Editar Tarefa</h3>
            <input type="text" id="editInput" placeholder="Digite a nova descrição...">
            <div class="modal-buttons">
                <button class="save-edit-btn">💾 Salvar</button>
                <button class="cancel-edit-btn">❌ Cancelar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

const editModal = createEditModal();
const editInput = document.querySelector("#editInput");

// Modal de confirmação
const confirmModal = document.getElementById("confirmModal");
const confirmMessage = document.getElementById("confirmMessage");
let pendingAction = null;

// Função para mostrar toast de notificação
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.background = type === 'success' ? '#4caf50' : '#ff4757';
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Carregar tarefas do localStorage
loadTasksFromStorage();

function updateTaskCount() {
    const tasks = document.querySelectorAll("#taskList li");
    const taskCountSpan = document.querySelector(".task-count");
    const taskCount = tasks.length;
    const completedTasks = document.querySelectorAll("#taskList li.completed").length;
    const pendingTasks = taskCount - completedTasks;
    
    if (taskCountSpan) {
        taskCountSpan.innerHTML = `📊 ${taskCount} total | ✅ ${completedTasks} concluída${completedTasks !== 1 ? 's' : ''} | ⏳ ${pendingTasks} pendente${pendingTasks !== 1 ? 's' : ''}`;
    }
    
    // Habilitar/desabilitar botão de excluir concluídas
    if (clearCompletedBtn) {
        clearCompletedBtn.disabled = completedTasks === 0;
        clearCompletedBtn.title = completedTasks === 0 ? "Nenhuma tarefa concluída para excluir" : "Excluir todas as tarefas concluídas";
    }
    
    // Mostrar mensagem quando não há tarefas
    if (taskCount === 0) {
        if (!document.querySelector(".empty-state")) {
            const emptyState = document.createElement("div");
            emptyState.className = "empty-state";
            emptyState.textContent = "✨ Nenhuma tarefa por aqui. Adicione algumas! ✨";
            taskList.parentNode.insertBefore(emptyState, taskList.nextSibling);
        }
    } else {
        const emptyState = document.querySelector(".empty-state");
        if (emptyState) emptyState.remove();
    }
}

function toggleComplete(li) {
    li.classList.toggle('completed');
    saveTasksToStorage();
    updateTaskCount();
}

function editTask(li, span) {
    currentEditingLi = li;
    currentEditingSpan = span;
    editInput.value = span.textContent;
    editModal.style.display = "block";
    editInput.focus();
}

function saveEdit() {
    const newText = editInput.value.trim();
    if (newText === "") {
        // Animação de erro
        editInput.style.animation = 'shake 0.3s ease';
        setTimeout(() => {
            editInput.style.animation = '';
        }, 300);
        return;
    }
    
    if (currentEditingSpan) {
        currentEditingSpan.textContent = newText;
        saveTasksToStorage();
        closeModal();
        showToast("✅ Tarefa editada com sucesso!", "success");
    }
}

function closeModal() {
    editModal.style.display = "none";
    currentEditingLi = null;
    currentEditingSpan = null;
    editInput.value = "";
}

function closeConfirmModal() {
    confirmModal.style.display = "none";
    pendingAction = null;
}

function showConfirmModal(message, action) {
    confirmMessage.textContent = message;
    pendingAction = action;
    confirmModal.style.display = "block";
}

function createTaskButtons(li) {
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'task-buttons';
    
    // Botão de completar/desfazer
    const completeBtn = document.createElement('button');
    completeBtn.className = 'complete-toggle-btn';
    completeBtn.textContent = '✓ Concluir';
    completeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleComplete(li);
        // Atualizar texto do botão baseado no estado
        if (li.classList.contains('completed')) {
            completeBtn.textContent = '↺ Desfazer';
            showToast("🎉 Tarefa concluída!", "success");
        } else {
            completeBtn.textContent = '✓ Concluir';
            showToast("🔄 Tarefa reativada!", "success");
        }
    });
    
    // Botão de editar
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = '✏️ Editar';
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const span = li.querySelector('span');
        editTask(li, span);
    });
    
    // Botão de excluir
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '🗑️ Excluir';
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showConfirmModal(`Tem certeza que deseja excluir a tarefa "${li.querySelector('span').textContent}"?`, () => {
            li.remove();
            updateTaskCount();
            saveTasksToStorage();
            showToast("🗑️ Tarefa excluída com sucesso!", "success");
        });
    });
    
    buttonsDiv.appendChild(completeBtn);
    buttonsDiv.appendChild(editBtn);
    buttonsDiv.appendChild(deleteBtn);
    
    return buttonsDiv;
}

function createSpan(taskInputValue) {
    const span = document.createElement('span');
    span.textContent = taskInputValue;
    return span;
}

function addTask() {
    const taskInputValue = taskInput.value.trim();
    
    if (taskInputValue === '') {
        // Animação de erro no input
        taskInput.style.animation = 'shake 0.3s ease';
        setTimeout(() => {
            taskInput.style.animation = '';
        }, 300);
        showToast("⚠️ Por favor, digite uma tarefa!", "error");
        return;
    }
    
    const li = document.createElement('li');
    const span = createSpan(taskInputValue);
    const buttons = createTaskButtons(li);
    
    li.appendChild(span);
    li.appendChild(buttons);
    
    taskList.appendChild(li);
    taskInput.value = '';
    taskInput.focus();
    
    updateTaskCount();
    saveTasksToStorage();
    showToast("✨ Tarefa adicionada com sucesso!", "success");
}

function saveTasksToStorage() {
    const tasks = [];
    document.querySelectorAll("#taskList li").forEach(li => {
        tasks.push({
            text: li.querySelector('span').textContent,
            completed: li.classList.contains('completed')
        });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasksFromStorage() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        tasks.forEach(task => {
            const li = document.createElement('li');
            if (task.completed) li.classList.add('completed');
            
            const span = createSpan(task.text);
            const buttons = createTaskButtons(li);
            
            // Atualizar texto do botão se estiver concluída
            if (task.completed) {
                const completeBtn = buttons.querySelector('.complete-toggle-btn');
                if (completeBtn) completeBtn.textContent = '↺ Desfazer';
            }
            
            li.appendChild(span);
            li.appendChild(buttons);
            taskList.appendChild(li);
        });
        updateTaskCount();
    } else {
        updateTaskCount();
    }
}

function clearAllTasks() {
    const taskCount = document.querySelectorAll("#taskList li").length;
    if (taskCount === 0) {
        showToast("📭 Nenhuma tarefa para excluir!", "error");
        return;
    }
    
    showConfirmModal("Tem certeza que deseja limpar TODAS as tarefas? Esta ação não pode ser desfeita!", () => {
        while (taskList.firstChild) {
            taskList.removeChild(taskList.firstChild);
        }
        updateTaskCount();
        saveTasksToStorage();
        showToast("🗑️ Todas as tarefas foram excluídas!", "success");
    });
}

function clearCompletedTasks() {
    const completedTasks = document.querySelectorAll("#taskList li.completed");
    const completedCount = completedTasks.length;
    
    if (completedCount === 0) {
        showToast("✅ Nenhuma tarefa concluída para excluir!", "error");
        return;
    }
    
    showConfirmModal(`Tem certeza que deseja excluir ${completedCount} tarefa${completedCount !== 1 ? 's' : ''} concluída${completedCount !== 1 ? 's' : ''}?`, () => {
        completedTasks.forEach(task => {
            task.remove();
        });
        updateTaskCount();
        saveTasksToStorage();
        showToast(`✅ ${completedCount} tarefa${completedCount !== 1 ? 's' : ''} concluída${completedCount !== 1 ? 's' : ''} excluída${completedCount !== 1 ? 's' : ''}!`, "success");
    });
}

// Event Listeners para o modal de edição
editModal.querySelector('.save-edit-btn').addEventListener('click', saveEdit);
editModal.querySelector('.cancel-edit-btn').addEventListener('click', closeModal);

// Event Listeners para o modal de confirmação
document.getElementById('confirmYesBtn').addEventListener('click', () => {
    if (pendingAction) {
        pendingAction();
    }
    closeConfirmModal();
});

document.getElementById('confirmNoBtn').addEventListener('click', closeConfirmModal);

// Fechar modais clicando fora
window.addEventListener('click', (e) => {
    if (e.target === editModal) {
        closeModal();
    }
    if (e.target === confirmModal) {
        closeConfirmModal();
    }
});

// Salvar edit com Enter
editInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        saveEdit();
    }
});

// Event Listeners principais
taskBtn.addEventListener("click", addTask);

// Adicionar tarefa com Enter
taskInput.addEventListener("keypress", function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        addTask();
    }
});

clearAllBtn.addEventListener("click", clearAllTasks);
clearCompletedBtn.addEventListener("click", clearCompletedTasks);

// Animar o botão quando adicionar
taskBtn.addEventListener("mousedown", function() {
    this.style.transform = "scale(0.98)";
});

taskBtn.addEventListener("mouseup", function() {
    this.style.transform = "";
});

// Adicionar animação de shake
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);