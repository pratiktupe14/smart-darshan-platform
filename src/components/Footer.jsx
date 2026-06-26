import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-on-background text-on-primary-fixed pt-xxl pb-xl border-t border-outline-variant/20">
      <div className="max-w-[80rem] mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-xxl mb-xxl">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-lg">
              <span className="material-symbols-outlined text-primary-fixed text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                temple_hindu
              </span>
              <span className="font-card-title text-card-title font-bold text-primary-fixed">शिव अर्धः नारेश्वरी नाग ज्योतिर्लिंग श्री क्षेत्र बिलमाळ (तुलसिगड)</span>
            </div>
            <p className="font-body text-sm text-surface-variant/80 leading-relaxed mb-xl">
              Modernizing spiritual administration with reverence and efficiency. Providing seamless darshan experiences for devotees worldwide.
            </p>
            <div className="flex gap-md">
              <a className="w-10 h-10 rounded-full bg-surface-container-low/10 flex items-center justify-center text-primary-fixed hover:bg-primary-fixed hover:text-on-primary-fixed transition-all" href="#">
                <span className="material-symbols-outlined text-xl">share</span>
              </a>
              <a className="w-10 h-10 rounded-full bg-surface-container-low/10 flex items-center justify-center text-primary-fixed hover:bg-primary-fixed hover:text-on-primary-fixed transition-all" href="#">
                <span className="material-symbols-outlined text-xl">public</span>
              </a>
            </div>
          </div>
          <div>
            <h5 className="text-primary-fixed font-bold mb-lg">Quick Links</h5>
            <ul className="space-y-sm">
              <li><Link className="text-surface-variant/80 hover:text-tertiary-fixed-dim transition-all text-sm" to="#">About Us</Link></li>
              <li><Link className="text-surface-variant/80 hover:text-tertiary-fixed-dim transition-all text-sm" to="#">Temple Features</Link></li>
              <li><Link className="text-surface-variant/80 hover:text-tertiary-fixed-dim transition-all text-sm" to="#">Live Queue Status</Link></li>
              <li><Link className="text-surface-variant/80 hover:text-tertiary-fixed-dim transition-all text-sm" to="#">Booking Help</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-primary-fixed font-bold mb-lg">Support</h5>
            <ul className="space-y-sm">
              <li><Link className="text-surface-variant/80 hover:text-tertiary-fixed-dim transition-all text-sm" to="#">Contact Support</Link></li>
              <li><Link className="text-surface-variant/80 hover:text-tertiary-fixed-dim transition-all text-sm" to="#">Privacy Policy</Link></li>
              <li><Link className="text-surface-variant/80 hover:text-tertiary-fixed-dim transition-all text-sm" to="#">Terms of Service</Link></li>
              <li><Link className="text-surface-variant/80 hover:text-tertiary-fixed-dim transition-all text-sm" to="#">Refund Policy</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-primary-fixed font-bold mb-lg">Contact Info</h5>
            <ul className="space-y-md text-surface-variant/80 text-sm">
              <li className="flex gap-2">
                <span className="material-symbols-outlined text-primary-fixed text-sm">mail</span>
                admin@templeflow.com
              </li>
              <li className="flex gap-2">
                <span className="material-symbols-outlined text-primary-fixed text-sm">call</span>
                +91 800-TEMPLE-FL
              </li>
              <li className="flex gap-2">
                <span className="material-symbols-outlined text-primary-fixed text-sm">location_on</span>
                शिव अर्धः नारेश्वरी नाग ज्योतिर्लिंग श्री क्षेत्र बिलमाळ (तुलसिगड), Main Road, Spiritual Center, 560001
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-xl border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-md text-center md:text-left">
          <p className="font-label-sm text-label-sm text-surface-variant/60">
            © 2024 शिव अर्धः नारेश्वरी नाग ज्योतिर्लिंग श्री क्षेत्र बिलमाळ (तुलसिगड). All rights reserved.
          </p>
          <div className="flex gap-xl">
            <a className="text-[10px] text-surface-variant/40 hover:text-primary-fixed uppercase tracking-widest" href="#">Designed for Devotion</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
