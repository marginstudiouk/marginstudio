import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ProductForm, { ProductsList } from '@/components/admin/ProductForm';
import PostForm, { PostsList } from '@/components/admin/PostForm';
import SubscribersList from '@/components/admin/SubscribersList';
import PortfolioForm, { PortfolioList } from '@/components/admin/PortfolioForm';
import CustomersList from '@/components/admin/CustomersList';
import InviteAdmin from '@/components/admin/InviteAdmin';

export default function Admin() {
  const [tab, setTab] = useState('products');
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const changeTab = (id) => {
    setTab(id);
    setEditingProduct(null);
    setEditingPost(null);
    setEditingItem(null);
  };

  return (
    <div className="px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
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

        <div className="flex gap-8 mb-10">
          {[
            { id: 'products', label: 'Products' },
            { id: 'posts', label: 'Journal posts' },
            { id: 'portfolio', label: 'Portfolio' },
            { id: 'customers', label: 'Customers' },
            { id: 'subscribers', label: 'Subscribers' },
            { id: 'team', label: 'Team' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => changeTab(t.id)}
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
        ) : tab === 'customers' ? (
          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-5">
              Customers &amp; purchases
            </p>
            <CustomersList />
          </div>
        ) : tab === 'team' ? (
          <InviteAdmin />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {tab === 'products' ? (
                <ProductForm editingProduct={editingProduct} onDone={() => setEditingProduct(null)} />
              ) : tab === 'posts' ? (
                <PostForm editingPost={editingPost} onDone={() => setEditingPost(null)} />
              ) : (
                <PortfolioForm editingItem={editingItem} onDone={() => setEditingItem(null)} />
              )}
            </div>
            <div className="lg:border-l lg:border-border lg:pl-12">
              <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-5">
                {tab === 'products' ? 'Existing products' : tab === 'posts' ? 'Existing posts' : 'Existing case studies'}
              </p>
              {tab === 'products' ? (
                <ProductsList onEdit={setEditingProduct} />
              ) : tab === 'posts' ? (
                <PostsList onEdit={setEditingPost} />
              ) : (
                <PortfolioList onEdit={setEditingItem} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
