<template>
  <div class="data-table-container">
    <!-- Barre d'outils -->
    <div class="table-toolbar">
      <div class="toolbar-left">
        <!-- Recherche globale -->
        <div class="search-container">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher..."
            class="search-input"
            @input="handleSearch"
          />
          <span class="search-icon">🔍</span>
        </div>

        <!-- Filtres -->
        <div class="filters-container" v-if="showFilters">
          <select v-model="selectedFilter" class="filter-select" @change="applyFilter">
            <option value="">Tous les filtres</option>
            <option v-for="filter in availableFilters" :key="filter.value" :value="filter.value">
              {{ filter.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="toolbar-right">
        <!-- Actions en lot -->
        <div class="bulk-actions" v-if="selectedItems.length > 0">
          <span class="selected-count">{{ selectedItems.length }} élément(s) sélectionné(s)</span>
          <button @click="exportSelected" class="action-btn action-btn-secondary">
            📊 Exporter Sélection
          </button>
          <button @click="deleteSelected" class="action-btn action-btn-danger">
            🗑️ Supprimer Sélection
          </button>
        </div>

        <!-- Export CSV -->
        <button @click="exportToCSV" class="action-btn action-btn-primary">
          📄 Exporter CSV
        </button>

        <!-- Sélection multiple -->
        <label class="select-all-container">
          <input
            type="checkbox"
            :checked="isAllSelected"
            @change="toggleSelectAll"
            class="select-all-checkbox"
          />
          <span class="select-all-text">Tout</span>
        </label>
      </div>
    </div>

    <!-- Tableau -->
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <!-- Colonne de sélection -->
            <th class="selection-column">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleSelectAll"
                class="select-all-checkbox"
              />
            </th>
            
            <!-- Colonnes de données -->
            <th
              v-for="column in visibleColumns"
              :key="column.key"
              class="table-header"
              :class="{ sortable: column.sortable }"
              @click="column.sortable ? sortBy(column.key) : null"
            >
              <div class="header-content">
                <span class="header-text">{{ column.label }}</span>
                <span v-if="column.sortable" class="sort-icon">
                  {{ getSortIcon(column.key) }}
                </span>
              </div>
            </th>

            <!-- Colonne d'actions -->
            <th class="actions-column" v-if="showActions">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="item in paginatedData"
            :key="getItemKey(item)"
            class="table-row"
            :class="{ selected: selectedItems.includes(getItemKey(item)) }"
          >
            <!-- Cellule de sélection -->
            <td class="selection-cell">
              <input
                type="checkbox"
                :checked="selectedItems.includes(getItemKey(item))"
                @change="toggleItemSelection(getItemKey(item))"
                class="item-checkbox"
              />
            </td>

            <!-- Cellules de données -->
            <td
              v-for="column in visibleColumns"
              :key="column.key"
              class="table-cell"
            >
              <div class="cell-content">
                <template v-if="column.formatter">
                  <component :is="column.formatter" :value="item[column.key]" :item="item" />
                </template>
                <template v-else>
                  {{ formatCellValue(item[column.key], column.type) }}
                </template>
              </div>
            </td>

            <!-- Cellule d'actions -->
            <td class="actions-cell" v-if="showActions">
              <div class="action-buttons">
                <button
                  v-if="actions.view"
                  @click="handleAction('view', item)"
                  class="action-btn action-btn-small action-btn-info"
                  title="Voir"
                >
                  👁️
                </button>
                <button
                  v-if="actions.edit"
                  @click="handleAction('edit', item)"
                  class="action-btn action-btn-small action-btn-warning"
                  title="Modifier"
                >
                  ✏️
                </button>
                <DeleteButton
                  v-if="actions.delete"
                  :item-id="getItemKey(item)"
                  :item-name="getItemName(item)"
                  size="small"
                  @confirmed="handleAction('delete', item)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Message si aucune donnée -->
      <div v-if="filteredData.length === 0" class="no-data">
        <p>Aucune donnée trouvée</p>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination-container" v-if="totalPages > 1">
      <div class="pagination-info">
        Affichage de {{ startIndex + 1 }} à {{ endIndex }} sur {{ filteredData.length }} éléments
      </div>
      
      <div class="pagination-controls">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          ← Précédent
        </button>
        
        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="['page-btn', { active: page === currentPage }]"
          >
            {{ page }}
          </button>
        </div>
        
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          Suivant →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useToast } from 'vue-toast-notification';
import DeleteButton from './DeleteButton.vue';

// Props
interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'currency';
  formatter?: any;
  width?: string;
}

interface Action {
  view?: boolean;
  edit?: boolean;
  delete?: boolean;
}

interface Props {
  data: any[];
  columns: Column[];
  itemsPerPage?: number;
  showFilters?: boolean;
  showActions?: boolean;
  actions?: Action;
  searchable?: boolean;
  sortable?: boolean;
  selectable?: boolean;
  itemKey?: string;
  itemName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerPage: 10,
  showFilters: true,
  showActions: true,
  actions: () => ({ view: true, edit: true, delete: true }),
  searchable: true,
  sortable: true,
  selectable: true,
  itemKey: 'id',
  itemName: 'name'
});

// Emits
const emit = defineEmits<{
  action: [action: string, item: any];
  selectionChange: [selectedItems: string[]];
  export: [data: any[], filename: string];
}>();

// Composables
const $toast = useToast();

// État local
const searchQuery = ref('');
const selectedFilter = ref('');
const currentPage = ref(1);
const sortColumn = ref('');
const sortDirection = ref<'asc' | 'desc'>('asc');
const selectedItems = ref<string[]>([]);

// Computed
const visibleColumns = computed(() => {
  return props.columns.filter(col => col.key !== 'actions');
});

const filteredData = computed(() => {
  let data = [...props.data];

  // Recherche
  if (searchQuery.value && props.searchable) {
    const query = searchQuery.value.toLowerCase();
    data = data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(query)
      )
    );
  }

  // Filtre
  if (selectedFilter.value) {
    data = data.filter(item => {
      // Logique de filtrage personnalisée
      return true; // À adapter selon les besoins
    });
  }

  // Tri
  if (sortColumn.value && props.sortable) {
    data.sort((a, b) => {
      const aVal = a[sortColumn.value];
      const bVal = b[sortColumn.value];
      
      if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return data;
});

const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / props.itemsPerPage);
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage;
  const end = start + props.itemsPerPage;
  return filteredData.value.slice(start, end);
});

const startIndex = computed(() => {
  return (currentPage.value - 1) * props.itemsPerPage;
});

const endIndex = computed(() => {
  return Math.min(startIndex.value + props.itemsPerPage, filteredData.value.length);
});

const isAllSelected = computed(() => {
  return paginatedData.value.length > 0 && 
         paginatedData.value.every(item => selectedItems.value.includes(getItemKey(item)));
});

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  
  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    const start = Math.max(1, currentPage.value - 2);
    const end = Math.min(totalPages.value, start + maxVisible - 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }
  
  return pages;
});

const availableFilters = computed(() => {
  // Filtres disponibles - à adapter selon les besoins
  return [
    { value: 'active', label: 'Actifs' },
    { value: 'inactive', label: 'Inactifs' }
  ];
});

// Méthodes
const getItemKey = (item: any): string => {
  return String(item[props.itemKey] || item.id || item._id);
};

const getItemName = (item: any): string => {
  return String(item[props.itemName] || item.name || item.title || 'Cet élément');
};

const formatCellValue = (value: any, type?: string): string => {
  if (value === null || value === undefined) return '-';
  
  switch (type) {
    case 'date':
      return new Date(value).toLocaleDateString('fr-FR');
    case 'currency':
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(value);
    case 'boolean':
      return value ? 'Oui' : 'Non';
    case 'number':
      return new Intl.NumberFormat('fr-FR').format(value);
    default:
      return String(value);
  }
};

const getSortIcon = (columnKey: string): string => {
  if (sortColumn.value !== columnKey) return '↕️';
  return sortDirection.value === 'asc' ? '↑' : '↓';
};

const handleSearch = () => {
  currentPage.value = 1;
};

const applyFilter = () => {
  currentPage.value = 1;
};

const sortBy = (columnKey: string) => {
  if (sortColumn.value === columnKey) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = columnKey;
    sortDirection.value = 'asc';
  }
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedItems.value = selectedItems.value.filter(id => 
      !paginatedData.value.some(item => getItemKey(item) === id)
    );
  } else {
    const newItems = paginatedData.value
      .map(item => getItemKey(item))
      .filter(id => !selectedItems.value.includes(id));
    selectedItems.value.push(...newItems);
  }
  
  emit('selectionChange', selectedItems.value);
};

const toggleItemSelection = (itemKey: string) => {
  const index = selectedItems.value.indexOf(itemKey);
  if (index > -1) {
    selectedItems.value.splice(index, 1);
  } else {
    selectedItems.value.push(itemKey);
  }
  
  emit('selectionChange', selectedItems.value);
};

const handleAction = (action: string, item: any) => {
  emit('action', action, item);
};

const exportToCSV = () => {
  try {
    const headers = visibleColumns.value.map(col => col.label).join(',');
    const rows = filteredData.value.map(item =>
      visibleColumns.value.map(col => {
        const value = item[col.key];
        return `"${formatCellValue(value, col.type)}"`;
      }).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    $toast.open({
      message: 'Export CSV réussi',
      type: 'success',
      position: 'bottom-left',
      duration: 3000
    });
  } catch (error) {
    $toast.open({
      message: 'Erreur lors de l\'export CSV',
      type: 'error',
      position: 'bottom-left',
      duration: 5000
    });
  }
};

const exportSelected = () => {
  const selectedData = props.data.filter(item => 
    selectedItems.value.includes(getItemKey(item))
  );
  
  emit('export', selectedData, `export_selection_${new Date().toISOString().split('T')[0]}.csv`);
};

const deleteSelected = () => {
  // Cette fonction sera gérée par le parent
  emit('action', 'deleteMultiple', selectedItems.value);
};

// Watchers
watch(selectedItems, (newSelection) => {
  emit('selectionChange', newSelection);
});

// Lifecycle
onMounted(() => {
  // Initialisation si nécessaire
});
</script>

<style scoped>
.data-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  flex-wrap: wrap;
  gap: 1rem;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-container {
  position: relative;
}

.search-input {
  padding: 0.5rem 2rem 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
  background: white;
}

.bulk-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #e3f2fd;
  border-radius: 4px;
}

.selected-count {
  font-size: 0.875rem;
  color: #1976d2;
  font-weight: 500;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.action-btn-primary {
  background: #696BE2;
  color: white;
}

.action-btn-primary:hover {
  background: #5a5cd1;
}

.action-btn-secondary {
  background: #6c757d;
  color: white;
}

.action-btn-secondary:hover {
  background: #5a6268;
}

.action-btn-danger {
  background: #dc3545;
  color: white;
}

.action-btn-danger:hover {
  background: #c82333;
}

.action-btn-small {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.action-btn-info {
  background: #17a2b8;
  color: white;
}

.action-btn-warning {
  background: #ffc107;
  color: #212529;
}

.select-all-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.select-all-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.select-all-text {
  font-size: 0.875rem;
  color: #666;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.table-header {
  background: #f8f9fa;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e9ecef;
  white-space: nowrap;
}

.table-header.sortable {
  cursor: pointer;
  user-select: none;
}

.table-header.sortable:hover {
  background: #e9ecef;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.sort-icon {
  font-size: 0.75rem;
}

.selection-column {
  width: 50px;
  text-align: center;
}

.actions-column {
  width: 120px;
  text-align: center;
}

.table-row {
  border-bottom: 1px solid #e9ecef;
  transition: background 0.2s ease;
}

.table-row:hover {
  background: #f8f9fa;
}

.table-row.selected {
  background: #e3f2fd;
}

.table-cell {
  padding: 0.75rem;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.selection-cell {
  text-align: center;
  padding: 0.75rem 0.5rem;
}

.actions-cell {
  text-align: center;
  padding: 0.75rem 0.5rem;
}

.cell-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
}

.item-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.no-data {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  font-size: 0.875rem;
  color: #666;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #f8f9fa;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  min-width: 40px;
}

.page-btn:hover {
  background: #f8f9fa;
}

.page-btn.active {
  background: #696BE2;
  color: white;
  border-color: #696BE2;
}

/* Responsive */
@media (max-width: 768px) {
  .table-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .toolbar-left,
  .toolbar-right {
    justify-content: center;
  }
  
  .search-input {
    min-width: 150px;
  }
  
  .bulk-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .pagination-container {
    flex-direction: column;
    text-align: center;
  }
  
  .pagination-controls {
    justify-content: center;
  }
  
  .page-numbers {
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .table-header,
  .table-cell {
    padding: 0.5rem 0.25rem;
    font-size: 0.75rem;
  }
  
  .action-btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
}
</style> 