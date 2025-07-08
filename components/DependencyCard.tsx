import React from 'react';
import { DependencyInfo } from '../types';

interface DependencyCardProps {
  title: string;
  dependencies: DependencyInfo[];
}

const StatusIndicator: React.FC<{ dep: DependencyInfo }> = ({ dep }) => {
  if (!dep.latestVersion) {
    return <span className="w-2.5 h-2.5 bg-slate-500 rounded-full flex-shrink-0" title="최신 버전을 확인하지 못했습니다."></span>;
  }
  // Simple check, doesn't account for complex semver ranges but good for this UI
  if (dep.version === dep.latestVersion) {
    return <span className="w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0" title="최신 버전입니다."></span>;
  }
  return <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full flex-shrink-0" title={`업데이트 가능: ${dep.latestVersion}`}></span>;
};

const DependencyCard: React.FC<DependencyCardProps> = ({ title, dependencies }) => {
  if (dependencies.length === 0) {
    return null; // Don't render if there are no dependencies of this type
  }

  return (
    <div className="first-of-type:mt-0 mt-4">
      <h4 className="text-base font-semibold text-slate-300 mb-3">{title} ({dependencies.length})</h4>
      <div className="space-y-2">
        {dependencies.sort((a,b) => a.name.localeCompare(b.name)).map(dep => (
          <div key={dep.name} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-slate-700/40 transition-colors duration-150">
            <div className="flex items-center gap-3 truncate min-w-0">
              <StatusIndicator dep={dep} />
              <a 
                href={`https://www.npmjs.com/package/${dep.name}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-slate-200 hover:text-sky-400 truncate"
                title={dep.name}
              >
                {dep.name}
              </a>
            </div>
            <div className="flex items-center gap-2 text-slate-400 flex-shrink-0 ml-2">
              <span className="font-mono bg-slate-700/80 px-2 py-0.5 rounded text-xs">{dep.version}</span>
              {dep.latestVersion && dep.version !== dep.latestVersion && (
                <>
                  <span className="text-slate-500">&rarr;</span>
                  <span className="font-mono bg-sky-900/80 text-sky-300 px-2 py-0.5 rounded text-xs">{dep.latestVersion}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DependencyCard;