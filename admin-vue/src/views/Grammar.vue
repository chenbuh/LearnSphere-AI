<script setup>
import AdminGrammarHeader from '@/components/AdminGrammarHeader.vue'
import AdminGrammarTableCard from '@/components/AdminGrammarTableCard.vue'
import AdminGrammarEditModal from '@/components/AdminGrammarEditModal.vue'
import { useAdminGrammar } from '@/composables/useAdminGrammar'

const {
  columns,
  dataList,
  formData,
  handleAdd,
  handlePageChange,
  handlePageSizeChange,
  handleSave,
  isEdit,
  loading,
  page,
  pageCount,
  pageSize,
  showModal
} = useAdminGrammar()
</script>

<template>
  <div class="grammar-page">
    <AdminGrammarHeader @add="handleAdd" />
    <AdminGrammarTableCard
      :columns="columns"
      :data-list="dataList"
      :loading="loading"
      :page="page"
      :page-count="pageCount"
      :page-size="pageSize"
      @update:page="handlePageChange"
      @update:page-size="handlePageSizeChange"
    />
    <AdminGrammarEditModal
      v-model:show="showModal"
      :is-edit="isEdit"
      :form-data="formData"
      @save="handleSave"
    />
  </div>
</template>

<style scoped>
.grammar-page {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
