import React, { useContext, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CCreateElement,
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CSidebarNavDivider,
  CSidebarNavTitle,
  CNavItem,
  CProgress,
  CSidebarMinimizer,
  CSidebarNavDropdown,
  CSidebarNavItem,
} from '@coreui/react'
import Roles from 'src/config/Roles'
import AuthContext from 'src/contexts/AuthContext'
import CIcon from '@coreui/icons-react'
import { useTranslation } from 'react-i18next'

// sidebar nav config
import adminNavigation from './navigation/adminNavigation';
import pickerNavigation from './navigation/pickerNavigation';
import sellerNavigation from './navigation/sellerNavigation';
import delivererNavigation from './navigation/delivererNavigation';
import { isDefined } from 'src/helpers/utils'

const TheSidebar = () => {
  const dispatch = useDispatch();
  const { currentUser } = useContext(AuthContext);
  const show = useSelector(state => state.sidebarShow);
  const { t, i18n } = useTranslation();
  const [nav, setNav] = useState([]);

  useEffect(() => {
      setAppropriateNavigation()
  }, []);

  useEffect(() => {
      setAppropriateNavigation()
  }, [currentUser]);

  const defineUserRole = () => {
    const mainRole = Roles.hasAdminPrivileges(currentUser) ? "ADMIN" : 
           (Roles.isSeller(currentUser) && Roles.isDeliverer(currentUser) || Roles.isPicker(currentUser)) ? "PICKER" : 
           Roles.isSeller(currentUser) ? "SELLER" :
           Roles.isDeliverer(currentUser) ? "DELIVERER" : "USER";
    return mainRole;
  };

  const setAppropriateNavigation = () => {
    const mainRole = defineUserRole(currentUser);
    const navigation = mainRole === "ADMIN" ? adminNavigation :
                       mainRole === "PICKER" ? pickerNavigation :
                       mainRole === "SELLER" ? sellerNavigation :
                       mainRole === "DELIVERER" ? delivererNavigation : null;
    if (isDefined(navigation))
        setNav(navigation.getNav(t));
  };

  return  !isDefined(nav) ? <></> : (
    <CSidebar
      show={show}
      unfoldable
      onShowChange={(val) => dispatch({type: 'set', sidebarShow: val })}
    >
      <CSidebarBrand className="d-md-down-none" to="/">
        <CIcon
          className="c-sidebar-brand-full"
          name="logo-negative"
          height={35}
        />
        <CIcon
          className="c-sidebar-brand-minimized"
          name="sygnet"
          height={35}
        />
      </CSidebarBrand>
      <CSidebarNav>

        <CCreateElement
          items={ nav }
          components={{
            CSidebarNavDivider,
            CSidebarNavDropdown,
            CSidebarNavItem,
            CSidebarNavTitle
          }}
        />

        <CSidebarNavDivider />
        <CSidebarNavTitle>System Utilization</CSidebarNavTitle>
        <CNavItem className="px-3 d-compact-none c-d-minimized-none">
          <div className="text-uppercase mb-1"><small><b>CPU Usage</b></small></div>
          <CProgress size="xs" value={25} color="info" />
          <small className="text-muted">348 Processes. 1/4 Cores.</small>
        </CNavItem>
        <CNavItem className="px-3 d-compact-none c-d-minimized-none">
          <div className="text-uppercase mb-1"><small><b>Memory Usage</b></small></div>
          <CProgress size="xs" value={70} color="warning" />
          <small className="text-muted">11444GB/16384MB</small>
        </CNavItem>
        <CNavItem className="px-3 mb-3 d-compact-none c-d-minimized-none">
          <div className="text-uppercase mb-1"><small><b>SSD 1 Usage</b></small></div>
          <CProgress size="xs" value={95} color="danger" />
          <small className="text-muted">243GB/256GB</small>
        </CNavItem>
      </CSidebarNav>
      <CSidebarMinimizer className="c-d-md-down-none"/>
    </CSidebar>
  )
}

export default React.memo(TheSidebar)
