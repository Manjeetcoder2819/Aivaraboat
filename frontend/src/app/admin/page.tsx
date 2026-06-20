'use client';

import React from 'react';
import ChatLayout from '@/components/layout/ChatLayout';
import KnowledgeStudio from '@/components/admin/KnowledgeStudio';

export default function AdminPage() {
  return (
    <ChatLayout>
      <KnowledgeStudio />
    </ChatLayout>
  );
}
