<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.title"
        placeholder="Title"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select v-model="listQuery.importance" placeholder="Imp" clearable style="width: 90px" class="filter-item">
        <el-option v-for="item in importanceOptions" :key="item" :label="item" :value="item"/>
      </el-select>
      <el-select v-model="listQuery.type" placeholder="Type" clearable class="filter-item" style="width: 130px">
        <el-option
          v-for="item in calendarTypeOptions"
          :key="item.key"
          :label="item.display_name+'('+item.key+')'"
          :value="item.key"
        />
      </el-select>
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key"/>
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        Add
      </el-button>
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >
        Export
      </el-button>
      <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
        reviewer
      </el-checkbox>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <!--显示=======================================================================================================================-->
      <el-table-column label="账号编号" width="150px" align="center" sortable="custom" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.anId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账号名称" prop="anNumber" align="center" width="300">
        <template slot-scope="{row}">
          <span>{{ row.anNumber}}</span>
        </template>
      </el-table-column>
      <el-table-column label="账号密码" min-width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.anPassword }}</span>
        </template>
      </el-table-column>
      <el-table-column label="职位编号" min-width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.postid }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="330" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            修改账号密码
          </el-button>
          <el-button type="primary" size="mini" @click="handleDelete(row)">
            删除账号
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />
    <!--模态框===============================================================================================================-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="90px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="账号" prop="anNumber">
          <el-input v-model="temp.anNumber" :autosize="{ minRows: 2, maxRows: 4}" placeholder="Please input"/>
        </el-form-item>
        <el-form-item label="密码" prop="anPassword">
          <el-input v-model="temp.anPassword" placeholder="Please input"/>
        </el-form-item>
        <el-form-item label="职位" prop="postid">
          <el-select v-model="temp.postid" class="filter-item" placeholder="Please select">
            <el-option
              v-for="item in calendarTypeOptions"
              :key="item.postid"
              :label="item.postname"
              :value="item.postid"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {querypost, fetchList, fetchPv, createArticle, updateArticle} from '@/api/article'
  import waves from '@/directive/waves' // waves directive
  import {parseTime} from '@/utils'
  import Pagination from '@/components/Pagination'
  import {adminlogin} from '../../api/article' // secondary package based on el-pagination

  const calendarTypeOptions = [{'postid': 1, 'postname': 'ls'}]

  // arr to obj, such as { CN : "China", US : "USA" }
  const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
    acc[cur.postid] = cur.postname
    return acc
  }, {})

  export default {
    name: 'ComplexTable',
    components: {Pagination},
    directives: {waves},
    filters: {
      statusFilter(status) {
        const statusMap = {
          published: 'success',
          draft: 'info',
          deleted: 'danger'
        }
        return statusMap[status]
      },
      typeFilter(type) {
        return calendarTypeKeyValue[type]
      }
    },
    data() {
      return {
        tableKey: 0,
        list: null,
        total: 0,
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 20,
          importance: undefined,
          title: undefined,
          title2: undefined,
          idcard: undefined,
          staffName: undefined,
          postId: undefined,
          sort: '+staffid'
        },
        importanceOptions: [1, 2, 3],
        calendarTypeOptions,
        sortOptions: [{label: 'ID Ascending', key: '+id'}, {label: 'ID Descending', key: '-id'}],
        statusOptions: ['published', 'draft', 'deleted'],
        showReviewer: false,
        temp: {
          jurid: undefined,
          jurname: '',
          jurfun: ''
        },
        staff: {
          staffid: undefined,
          postId: undefined,
          staffName: '',
          idcard: '',
          type: undefined,
          state: 'published'
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: 'Edit',
          create: 'Create'
        },
        // 验证信息===============================================================================================================
        dialogPvVisible: false,
        pvData: [],
        rules: {
          anNumber: [{required: true, message: '账号不能为空', trigger: 'blur'}],
          anPassword: [{required: true, message: '密码不能为空', trigger: 'blur'}]
        },
        downloadLoading: false
      }
    },
    created(url, config) {
      const http = this.$axios.create({
        // 访问的根路径
        baseURL: 'http://192.168.43.27:8080/',
        // 请求超时时间
        timeout: 5000,
        // 是否携带凭证

        responseType: 'json'
      })
      // 添加请求拦截器
      http.interceptors.request.use(function (config) {
        // 在发送请求之前做些什么
        return config
      }, function (error) {
        // 对请求错误做些什么
        return Promise.reject(error)
      })

      // 添加响应拦截器
      http.interceptors.response.use(function (response) {
        // 对响应数据做点什么
        return response.data
      }, function (error) {
        // 对响应错误做点什么
        return Promise.reject(error)
      })
      const dddd = {

        anNumber: '5',
        anPassWord: '5'

      }
      const data = this.param(dddd)
      console.log('data')
      console.log(data)
      http.post(`/login-check`, this.param(dddd), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).then(response => {
        console.log('login-check')
        console.log(response.data)
      })
      this.getList()
      this.query()
    },
    methods: {
      param(data) {
        let url = ''
        for (const k in data) {
          const value = data[k] != undefined ? data[k] : ''
          url += `&${k}=${encodeURIComponent(value)}`
        }
        return url ? url.substring(1) : ''
      },
      // 关联查询的另外的表==========================================================================================================关联查询的另外的表
      query: function () {
        this.$axios.post('http://192.168.43.27:8080/Post/query').then(response => {
          console.log(response.data)
          this.calendarTypeOptions = response.data
          this.getList(response.data)
        })
      },
      // 查询=======================================================================================================================查询
      getList() {
        this.listLoading = true
        fetchList(this.listQuery).then(response => {
          this.$axios.post('http://192.168.43.27:8080/An/query').then(response => {
            console.log(response.data)
            this.list = response.data
          })
          // this.list = response.data.items
          console.log(response.data.items)
          this.total = 1
          console.log('total:' + this.total)
          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
        })
      }
      ,
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      }
      ,
      handleModifyStatus(row, status) {
        console.log(row)

        this.$axios.get('http://192.168.43.27:8080/An/update', {params: row}).then(response => {
          this.$message({
            message: '修改成功',
            type: 'success'
          })
        })
        row.state = status
      }
      ,
      sortChange(data) {
        const {prop, order} = data
        if (prop === 'id') {
          this.sortByID(order)
        }
      }
      ,
      sortByID(order) {
        if (order === 'ascending') {
          this.listQuery.sort = '+id'
        } else {
          this.listQuery.sort = '-id'
        }
        this.handleFilter()
      }
      ,
      resetTemp() {
        this.temp = {
          staffid: undefined,
          postId: undefined,
          staffName: '',
          idcard: '',
          state: 'published'
        }
      }
      ,
      handleCreate() {
        this.resetTemp()
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      }
      ,
      // 添加=======================================================================================================================添加
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            const tempData = Object.assign({}, this.temp)
            this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
            this.temp.author = 'vue-element-admin'
            createArticle(this.temp).then(() => {
              this.list.unshift(this.temp)
              this.dialogFormVisible = false
              this.$notify({
                title: 'Success',
                message: 'Created Successfully',
                type: 'success',
                duration: 2000
              })
            })
            this.$axios.get('http://192.168.43.27:8080/An/add', {params: tempData}).then(response => {
              this.getList()
            })
          }
        })
      }
      ,
      handleUpdate(row) {
        this.temp = Object.assign({}, row) // copy obj
        console.log('temp')
        console.log(this.temp)
        this.temp.timestamp = new Date(this.temp.timestamp)
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      }
      ,
      // 修改=======================================================================================================================修改
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          console.log(valid)
          if (valid) {
            const tempData = Object.assign({}, this.temp)
            console.log(tempData)
            tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
            updateArticle(tempData).then(() => {
              const index = this.list.findIndex(v => v.id === this.temp.id)
              this.list.splice(index, 1, this.temp)
              this.dialogFormVisible = false
              this.$notify({
                title: 'Success',
                message: 'Update Successfully',
                type: 'success',
                duration: 2000
              })
            })
            tempData.authorities = null
            tempData.timestamp = null
            this.$axios.get('http://192.168.43.27:8080/An/update', {
              params: tempData,
              headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(response => {
              this.query()
            })
          }
        })
      }
      ,
      // 删除=======================================================================================================================删除
      handleDelete(row, index) {
        this.$notify({
          title: 'Success',
          message: 'Delete Successfully',
          type: 'success',
          duration: 2000
        })
        this.list.splice(index, 1)
        this.$axios.get('http://192.168.43.27:8080/An/delete', {
          params: {anId: row.anId},
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(response => {
          this.getList()
        })
      }
      ,
      handleFetchPv(pv) {
        fetchPv(pv).then(response => {
          this.pvData = response.data.pvData
          this.dialogPvVisible = true
        })
      }
      ,
      handleDownload() {
        this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
          const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
          const data = this.formatJson(filterVal)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: 'table-list'
          })
          this.downloadLoading = false
        })
      }
      ,
      formatJson(filterVal) {
        return this.list.map(v => filterVal.map(j => {
          if (j === 'timestamp') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        }))
      }
      ,
      getSortClass: function (key) {
        const sort = this.listQuery.sort
        return sort === `+${key}` ? 'ascending' : 'descending'
      }
    }
  }
</script>
