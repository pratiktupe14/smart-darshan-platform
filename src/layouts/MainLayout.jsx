import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background font-body selection:bg-primary-fixed selection:text-on-primary-fixed">
      <Header />
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
