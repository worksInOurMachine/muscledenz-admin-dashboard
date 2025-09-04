'use client'

import React from 'react'
import { SidebarProvider as SP } from '../ui/sidebar'

function SideBarProvider({children}:any) {
  return (
    <>
    <SP>
    {
        children
    }
    </SP>
    </>
  )
}

export default SideBarProvider
