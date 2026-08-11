import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ProductForm, { ProductsList } from '@/components/admin/ProductForm';
import PostForm, { PostsList } from '@/components/admin/PostForm';
import SubscribersList from '@/components/admin/SubscribersList';
import PortfolioForm, { PortfolioList } from '@/components/admin/PortfolioForm';
import InviteAdmin from '@/components/admin/InviteAdmin';

export default function Admin() {
  // AdminRoute (in App.jsx) already guarantees we only get here as a logged-in admin.
  const [tab, setTab] = useState('products');

  return (
    <div className="px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <span className="font-mono text-xs tracking-widest uppercase text-primary mb-3 block">CMS</span>
          <h1 className="font-display text-4xl md:text-5xl tracking-wide text-foreground leading-[0.9] mb-2">
            Studio admin
          </h1>
          <p className="text-sm font-sans text-muted-foreground">Add products and journal posts.</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-8 mb-10">
          {[
            { id: 'products', label: 'Products' },
            { id: 'posts', label: 'Journal posts' },
            { id: 'portfolio', label: 'Portfolio' },
            { id: 'subscribers', label: 'Subscribers' },
            { id: 'team', label: 'Team' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`font-mono text-xs tracking-widest uppercase pb-2 transition-colors ${
                tab === t.id ? 'text-foreground border-b border-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'subscribers' ? (
          <div className="max-w-2xl">
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-5">
              Newsletter subscribers
            </p>
            <SubscribersList />
          </div>
        ) : tab === 'team' ? (
          <InviteAdmin />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              {tab === 'products' ? <ProductForm /> : tab === 'posts' ? <PostForm /> : <PortfolioForm />}
            </div>
            <div className="lg:border-l lg:border-border lg:pl-12">
              <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-5">
                {tab === 'products' ? 'Existing products' : tab === 'posts' ? 'Existing posts' : 'Existing case studies'}
              </p>
              {tab === 'products' ? <ProductsList /> : tab === 'posts' ? <PostsList /> : <PortfolioList />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}