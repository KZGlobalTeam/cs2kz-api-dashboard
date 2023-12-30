<template>
  <div class="bg-gray-800 rounded-md p-4 text-slate-200">
    <!-- selectors -->
    <div class="flex gap-4">
      <n-input size="small" placeholder="Search">
        <template #prefix>
          <ion-icon name="search-sharp"></ion-icon>
        </template>
      </n-input>
      <n-date-picker v-model:value="timestamp" placeholder="Release" type="month" clearable />
    </div>

    <!-- maps table -->
    <div>
      <n-data-table remote ref="table" :columns="columns" :data="data" :loading="loading" :pagination="pagination"
        :row-key="rowKey" @update:sorter="handleSorterChange" @update:page="handlePageChange" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { NInput, NDatePicker, NDataTable } from 'naive-ui';
import type { DataTableSortState, DataTableColumn } from 'naive-ui';
import type { Map } from '../types';

type RowData = {
  id: number,
  name: string,
  created_on: string,
  updated_on: string
}

const loading = ref(true)
const data = ref([])

const columns = ref([
  {
    title: 'ID',
    key: 'id',
    // if its sorted initially
    // 'descend' | 'ascend' | false
    sortOrder: false,
    sorter(rowA: RowData, rowB: RowData) { return rowA.id - rowB.id }
  },
  {
    title: 'Map',
    key: 'mapname',
    sortOrder: false,
    // use Array.sort
    sorter: false
  },
  {
    title: 'Created',
    key: 'created_on',
    sortOrder: false,
    sorter(rowA: RowData, rowB: RowData){
      return new Date(rowA.created_on).getTime() - new Date(rowB.created_on).getTime()
    }
  },
  {
    title: 'Updated',
    key: 'updated_on',
    sortOrder: 'descend',
    sorter(rowA: RowData, rowB: RowData){
      return new Date(rowA.updated_on).getTime() - new Date(rowB.updated_on).getTime()
    }
  }
])

const pagination = reactive({
  page: 1,
  pageCount: 1,
  pageSize: 10,
  prefix({ itemCount }) {
    return `Total is ${itemCount}.`
  }
})

const timestamp = ref(null)

function rowKey(rowData: RowData) {
  return rowData.id
}

function handleSorterChange(sorter: DataTableSortState | null) {
  if (!loading.value) {
    loading.value = true
    query(
      pagination.page,
      pagination.pageSize,
    ).then((result) => {
      columns.value.forEach((column) => {
        /** column.sortOrder !== undefined means it is uncontrolled */
        if (column.sortOrder === undefined) return
        if (!sorter) {
          column.sortOrder = false
          return
        }
        if (column.key === sorter.columnKey) column.sortOrder = sorter.order
        else column.sortOrder = false
      })
      data.value = result.data
      pagination.pageCount = result.pageCount
      pagination.itemCount = result.total
      loading.value = false
    })
  }
}

function handlePageChange(currentPage: number) {
  if (!loading.value) {
    loading.value = true
    query(
      currentPage,
      pagination.pageSize,
    ).then((result) => {
      data.value = result.data
      pagination.page = currentPage
      pagination.pageCount = result.pageCount
      pagination.itemCount = result.total
      loading.value = false
    })
  }
}

function query(page: number, pageSize = 10) {
  return new Promise((resolve) => {
    fetch('maps.json').then((res) => res.json()).then((res) => {
      const data = res.data
      const copiedData = data.map((v) => v)
      const pagedData = copiedData.slice((page - 1) * pageSize, page * pageSize)
      const total = copiedData.length
      const pageCount = Math.ceil(copiedData.length / pageSize)
      setTimeout(
        () =>
          resolve({
            pageCount,
            data: pagedData,
            total
          }),
        1500
      )
    })
  })
}
</script>