'use client';

import { Breadcrumb } from '@/components/shared/breadcrumb';
import { ChatIaWidget } from '@/components/chat-ia/chat-ia';

export default function AdminChatIaPage() {
  return (
    <div>
      <Breadcrumb items={[{ label: 'Assistant IA' }]} />

      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          Assistant IA
        </h1>
        <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground">
          Analysez, interrogez et gérez les données des infrastructures scolaires avec l&apos;intelligence artificielle
        </p>
      </div>

      <ChatIaWidget />
    </div>
  );
}
