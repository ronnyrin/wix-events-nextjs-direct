'use client';
import React from 'react';
import { Sidebar } from './Sidebar';
import { CartView } from '../CartSidebar/CartView';
import { useUI } from '../Provider/context';

export const SidebarUI: React.FC = () => {
  const { displaySidebar, closeSidebar } = useUI();
  return displaySidebar ? (
    <Sidebar onClose={closeSidebar}>
      <CartView />
    </Sidebar>
  ) : null;
};
