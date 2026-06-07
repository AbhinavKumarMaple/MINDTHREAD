'use client';

import { useParams } from 'next/navigation';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { EntryEditor } from '@/components/journal/EntryEditor';
import { ProcessedEntry } from '@/components/journal/ProcessedEntry';
import { useEntry } from '@/lib/query/hooks';

export default function EntryPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useEntry(params.id);

  if (isLoading) {
    return (
      <Screen header={<ScreenHeader />}>
        <LoadingState label="Loading entry…" />
      </Screen>
    );
  }
  if (isError || !data) {
    return (
      <Screen header={<ScreenHeader />}>
        <ErrorState
          title="Entry not found"
          onRetry={() => refetch()}
        />
      </Screen>
    );
  }

  const entry = data.entry;
  if (entry.status === 'processing') {
    return (
      <Screen header={<ScreenHeader />}>
        <LoadingState label="Processing your entry…" />
      </Screen>
    );
  }
  if (entry.status === 'processed') {
    return <ProcessedEntry entry={entry} />;
  }
  return <EntryEditor entry={entry} />;
}
