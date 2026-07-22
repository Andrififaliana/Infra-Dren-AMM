'use client';

import { Breadcrumb } from '@/components/shared/breadcrumb';
import { ChatIaWidget } from '@/components/chat-ia/chat-ia';

export default function ResponsableChatIaPage() {
  return (
    <div>
      <Breadcrumb items={[{ label: 'Assistant IA' }]} />

      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          Assistant IA
        </h1>
        <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground">
          Posez des questions sur les données et gérez les infrastructures avec l&apos;intelligence artificielle
        </p>
      </div>

      <ChatIaWidget />
    </div>
  );
}
