const API_URL = 'https://desafio-app-fullstack-back-1.onrender.com/api/entries';

const form = document.getElementById('entry-form');
const entryId = document.getElementById('entry-id');
const raca = document.getElementById('raca');
const tamanho = document.getElementById('tamanho');
const cor = document.getElementById('cor');
const entriesList = document.getElementById('entries-list');
const message = document.getElementById('message');
const cancelEdit = document.getElementById('cancel-edit');
const formTitle = document.getElementById('form-title');
const reloadBtn = document.getElementById('reload-btn');

function showMessage(text) {
  message.textContent = text;
}

function clearForm() {
  form.reset();
  entryId.value = '';
  formTitle.textContent = 'Novo registro';
  cancelEdit.classList.add('hidden');
}

function formatDate(date) {
  return new Date(date).toLocaleString('pt-BR');
}

async function loadEntries() {
  const response = await fetch(API_URL);
  const entries = await response.json();

  if (!entries.length) {
    entriesList.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🐕</span>
        <p>Nenhum registro encontrado.</p>
      </div>
    `;
    return;
  }
  
  entriesList.innerHTML = entries.map(entry => `
    <div class="entry-item">
      <div class="entry-info">
        <span class="entry-raca">${entry.raca}</span>
        <div class="entry-details">
          <span class="entry-tag">📏 ${entry.tamanho}</span>
          <span class="entry-tag">🎨 ${entry.cor}</span>
        </div>
      </div>
      <div class="entry-buttons">
        <button class="btn-edit" onclick="editEntry('${entry._id}')">Editar</button>
        <button class="btn-delete" onclick="deleteEntry('${entry._id}')">Excluir</button>
      </div>
    </div>
  `).join('');
}

async function saveEntry(data) {
  const id = entryId.value;
  const url = id ? `${API_URL}/${id}` : API_URL;
  const method = id ? 'PUT' : 'POST';

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

window.editEntry = async function (id) {
  const response = await fetch(`${API_URL}/${id}`);
  const entry = await response.json();

  entryId.value = entry._id;
  raca.value = entry.raca;
  tamanho.value = entry.tamanho;
  cor.value = entry.cor

  formTitle.textContent = 'Editar registro';
  cancelEdit.classList.remove('hidden');
  showMessage('Editando registro.');
};

window.deleteEntry = async function (id) {
  if (!confirm('Deseja excluir este registro?')) return;

  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  showMessage('Registro excluído.');
  loadEntries();
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    raca: raca.value,
    tamanho: tamanho.value,
    cor: cor.value
  };

  await saveEntry(data);
  showMessage(entryId.value ? 'Registro atualizado.' : 'Registro criado.');
  clearForm();
  loadEntries();
});

cancelEdit.addEventListener('click', () => {
  clearForm();
  showMessage('Edição cancelada.');
});

reloadBtn.addEventListener('click', loadEntries);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('./service-worker.js');
      console.log('Service Worker registrado com sucesso.');
    } catch (error) {
      console.log('Erro ao registrar Service Worker:', error);
    }
  });
}

clearForm();
loadEntries();
