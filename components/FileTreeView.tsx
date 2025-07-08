import React, { useState } from 'react';
import { FileTreeNode } from '../types';
import { FOLDER_ICON, FILE_ICON } from '../constants';

interface FileTreeViewProps {
  node: FileTreeNode;
  level?: number;
  onFileSelect: (path: string) => void;
  selectedFilePath: string | null;
}

const FileTreeView: React.FC<FileTreeViewProps> = ({ node, level = 0, onFileSelect, selectedFilePath }) => {
  if (!node) return null;

  const isFolder = node.type === 'folder';
  const [isExpanded, setIsExpanded] = useState(level === 0 || node.name === 'src');

  const handleToggle = () => {
    if (isFolder) {
      setIsExpanded(!isExpanded);
    } else {
      onFileSelect(node.path);
    }
  };
  
  const isSelected = !isFolder && selectedFilePath === node.path;
  const selectedClass = isSelected ? 'bg-sky-600/50' : 'hover:bg-slate-700/50';

  return (
    <div style={{ paddingLeft: level > 0 ? '0.5rem' : '0' }}>
      <div 
        className={`flex items-center py-1.5 text-slate-300 rounded-md px-2 cursor-pointer ${selectedClass} transition-colors duration-150`}
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleToggle()}
        title={node.path}
      >
        {isFolder ? (
            <span className="w-5 h-5 flex items-center justify-center mr-1 transition-transform duration-200 flex-shrink-0" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </span>
        ) : <div className="w-5 h-5 mr-1 flex-shrink-0"></div>}
        {isFolder ? FOLDER_ICON : FILE_ICON}
        <span className="truncate text-sm">{node.name}</span>
      </div>
      {isFolder && isExpanded && node.children && (
        <div style={{ paddingLeft: '0.75rem' }}>
          {node.children.map((child) => (
            <FileTreeView 
              key={child.path} 
              node={child} 
              level={level + 1} 
              onFileSelect={onFileSelect}
              selectedFilePath={selectedFilePath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileTreeView;