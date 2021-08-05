import React from 'react'
import { CFooter } from '@coreui/react'

const TheFooter = () => {
  return (
    <CFooter fixed={false}>
      <div>
        <a href="https://coreui.io" target="_blank" rel="noopener noreferrer">Cap Méchant</a>
        <span className="ml-1">&copy; {(new Date).getFullYear()}.</span>
      </div>
      <div className="mfs-auto">
        <span className="mr-1">Powered by</span>
        <a href="https://coreui.io/react" target="_blank" rel="noopener noreferrer">Digital Guild</a>
      </div>
    </CFooter>
  )
}

export default React.memo(TheFooter)
