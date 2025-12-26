import { ScriptCard } from '../scripts/library';

type ScriptsPageProps = {
  scripts: ScriptCard[];
  copiedId: string | null;
  onCopy: (script: ScriptCard) => void;
};

export function ScriptsPage({ scripts, copiedId, onCopy }: ScriptsPageProps) {
  return (
    <div className="h-full w-full overflow-auto p-4 space-y-3" style={{ backgroundColor: '#303030' }}>
      {scripts.map((script) => (
        <div
          key={script.id}
          className="rounded-xl p-4 border shadow-sm"
          style={{ backgroundColor: '#2f2f2f', borderColor: '#404040', color: '#f4f4f4' }}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="text-sm font-semibold" style={{ color: '#f4f4f4' }}>
                {script.title}
              </div>
              <p className="text-xs" style={{ color: '#c2c2c2' }}>
                {script.description}
              </p>
            </div>
            <button
              onClick={() => onCopy(script)}
              className="px-3 py-1 rounded-md text-xs"
              style={{ backgroundColor: '#3c3c3c', color: '#f8f8f8' }}
            >
              {copiedId === script.id ? 'Copied' : 'Copy script'}
            </button>
          </div>
          <div
            className="text-xxs rounded-md p-3 overflow-auto"
            style={{ backgroundColor: '#262626', border: '1px solid #3a3a3a', color: '#cfcfcf' }}
          >
            <pre className="whitespace-pre-wrap text-[11px] leading-relaxed" style={{ color: '#cfcfcf' }}>
              {script.code.slice(0, 600)}
              {script.code.length > 600 ? '... copy to view all' : ''}
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
}
