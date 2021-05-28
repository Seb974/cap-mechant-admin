import React from 'react'
import CIcon from '@coreui/icons-react'

function getNav(translation)
{
  
  return [
    {
      _tag: 'CSidebarNavItem',
      name: 'Dashboard',
      to: '/dashboard',
      icon: <CIcon name="cil-speedometer" customClasses="c-sidebar-nav-icon"/>,
      badge: {
        color: 'info',
        text: 'NEW',
      }
    },
    {
      _tag: 'CSidebarNavTitle',
      _children: ['Theme']
    },
    {
      _tag: 'CSidebarNavItem',
      name: translation("colors.label"),
      to: '/theme/colors',
      icon: 'cil-drop',
    },
    {
      _tag: 'CSidebarNavItem',
      name: translation("typography.label"),
      to: '/theme/typography',
      icon: 'cil-pencil',
    },
    {
      _tag: 'CSidebarNavTitle',
      _children: [translation("orders.label")]
    },
    {
      _tag: 'CSidebarNavItem',
      name: translation("preparations.label"),
      to: '/components/preparations',
      icon: <CIcon name="cil-dinner" customClasses="c-sidebar-nav-icon"/>,
    },
    {
      _tag: 'CSidebarNavTitle',
      _children: [translation("component.label")]
    },
    {
      _tag: 'CSidebarNavItem',
      name: translation("products.label"),
      to: '/components/products',
      icon: <CIcon name="cil-fastfood" customClasses="c-sidebar-nav-icon"/>,
    },
    {
      _tag: 'CSidebarNavItem',
      name: translation("sellers.label"),
      to: '/components/sellers',
      icon: <CIcon name="cil-contact" customClasses="c-sidebar-nav-icon"/>,
    },
    {
      _tag: 'CSidebarNavTitle',
      _children: ['Extras'],
    },
    {
      _tag: 'CSidebarNavDropdown',
      name: 'Pages',
      route: '/pages',
      icon: 'cil-star',
      _children: [
        {
          _tag: 'CSidebarNavItem',
          name: 'Login',
          to: '/login',
        },
        {
          _tag: 'CSidebarNavItem',
          name: 'Register',
          to: '/register',
        },
        {
          _tag: 'CSidebarNavItem',
          name: 'Error 404',
          to: '/404',
        },
        {
          _tag: 'CSidebarNavItem',
          name: 'Error 500',
          to: '/500',
        },
      ],
    },
    {
      _tag: 'CSidebarNavItem',
      name: 'Disabled',
      icon: 'cil-ban',
      badge: {
        color: 'secondary',
        text: 'NEW',
      },
      addLinkClass: 'c-disabled',
      'disabled': true
    },
    {
      _tag: 'CSidebarNavDropdown',
      name: 'Apps',
      route: '/apps',
      icon: 'cil-layers',
      _children: [
        {
          _tag: 'CSidebarNavDropdown',
          name: 'Invoicing',
          route: '/apps/invoicing',
          icon: 'cil-spreadsheet',
          _children: [
            {
              _tag: 'CSidebarNavItem',
              name: 'Invoice',
              to: '/apps/invoicing/invoice',
              badge: {
                color: 'danger',
                text: 'PRO'
              }
            }
          ]
        },
        {
          _tag: 'CSidebarNavDropdown',
          name: 'Email',
          route: '/apps/email',
          icon: 'cil-envelope-open',
          _children: [
            {
              _tag: 'CSidebarNavItem',
              name: 'Inbox',
              to: '/apps/email/inbox',
              badge: {
                color: 'danger',
                text: 'PRO',
              },
            },
            {
              _tag: 'CSidebarNavItem',
              name: 'Message',
              to: '/apps/email/message',
              badge: {
                color: 'danger',
                text: 'PRO',
              },
            },
            {
              _tag: 'CSidebarNavItem',
              name: 'Compose',
              to: '/apps/email/compose',
              badge: {
                color: 'danger',
                text: 'PRO',
              },
            },
          ],
        },
      ]
    },
    {
      _tag: 'CSidebarNavDivider',
      className: 'm-2'
    },
    {
      _tag: 'CSidebarNavTitle',
      _children: ['Labels']
    },
    {
      _tag: 'CSidebarNavItem',
      name: 'Label danger',
      to: '',
      icon: {
        name: 'cil-star',
        className: 'text-danger'
      },
      label: true
    },
    {
      _tag: 'CSidebarNavItem',
      name: 'Label info',
      to: '',
      icon: {
        name: 'cil-star',
        className: 'text-info'
      },
      label: true
    },
    {
      _tag: 'CSidebarNavItem',
      name: 'Label warning',
      to: '',
      icon: {
        name: 'cil-star',
        className: 'text-warning'
      },
      label: true
    },
    {
      _tag: 'CSidebarNavDivider',
      className: 'm-2'
    }
  ]
}

export default {
   getNav
}
