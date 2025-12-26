import { ScriptCard } from '../scripts/library';

type ScriptsPageProps = {
  scripts: ScriptCard[];
  copiedId: string | null;
  onCopy: (script: ScriptCard) => void;
  onRun: (script: ScriptCard) => void;
};

export function ScriptsPage({ scripts, copiedId, onCopy, onRun }: ScriptsPageProps) {
  return (
    <div className="h-full w-full overflow-auto bg-[#303030] p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-7xl mx-auto">
        {scripts.map((script) => (
          <div
            key={script.id}
            className="flex flex-col bg-[#262626] border border-[#404040] rounded-xl p-4 shadow-sm hover:border-[#606060] transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="text-sm font-semibold text-[#f4f4f4]">
                  {script.title}
                </div>
                <p className="text-xs text-[#c2c2c2] mt-1">
                  {script.description}
                </p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => onRun(script)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 text-center"
                >
                  Run
                </button>
                <button
                  onClick={() => onCopy(script)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    copiedId === script.id
                      ? 'bg-green-600 text-white'
                      : 'bg-[#3c3c3c] text-[#f8f8f8] hover:bg-[#4a4a4a]'
                  }`}
                >
                  {copiedId === script.id ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="relative flex-1 min-h-[80px] bg-[#1e1e1e] border border-[#333] rounded-lg p-3 overflow-hidden group">
              <pre className="whitespace-pre-wrap text-[10px] leading-relaxed font-mono text-[#a0a0a0] break-all">
                {script.code.slice(0, 300)}
                {script.code.length > 300 && '...'}
              </pre>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1e1e1e]/90 pointer-events-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
