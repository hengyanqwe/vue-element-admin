/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const tableRouter = {
  path: '/table',
  component: Layout,
  redirect: '/table/staff-table',
  name: 'Table',
  meta: {
    title: 'Table',
    icon: 'table',
    roles: ['admin']
  },
  children: [
    {
      path: 'dynamic-table',
      component: () => import('@/views/table/dynamic-table/index'),
      name: 'DynamicTable',
      meta: { title: 'Dynamic Table' }
    },
    {
      path: 'drag-table',
      component: () => import('@/views/table/drag-table'),
      name: 'DragTable',
      meta: { title: 'Drag Table' }
    },
    {
      path: 'inline-edit-table',
      component: () => import('@/views/table/inline-edit-table'),
      name: 'InlineEditTable',
      meta: { title: 'Inline Edit' }
    },
    {
      path: 'staff-table',
      component: () => import('@/views/table/staff-table'),
      name: 'StaffTable',
      meta: {title: 'Staff Table'}
    },
    {
      path: 'post-table',
      component: () => import('@/views/table/post-table'),
      name: 'PostTable',
      meta: {title: 'Post Table'}
    },
    {
      path: 'complex-table',
      component: () => import('@/views/table/complex-table'),
      name: 'ComplexTable',
      meta: { title: 'Complex Table' }
    },
    {
      path: 'an-table',
      component: () => import('@/views/table/an-table'),
      name: 'AnTable',
      meta: {title: 'An Table'}
    },
    {
      path: 'jur-table',
      component: () => import('@/views/table/jur-table'),
      name: 'jur-Table',
      meta: {title: 'jur Table'}
    }
  ]
}
export default tableRouter
