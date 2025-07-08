import { FileInfo, FileTreeNode } from '../types';

export const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    reader.onerror = (error) => {
      console.error(`파일 읽기 오류 ${file.name}:`, error);
      // Resolve with empty string on error to not fail the whole batch
      resolve(''); 
    };
    reader.readAsText(file);
  });
};

export const processFiles = async (fileList: FileList): Promise<FileInfo[]> => {
  const filePromises = Array.from(fileList).map(async (file) => {
    const content = await readFileContent(file);
    const path = (file as any).webkitRelativePath || file.name;
    const extension = file.name.split('.').pop() || '';
    return {
      name: file.name,
      path,
      size: file.size,
      content,
      extension,
    };
  });
  return Promise.all(filePromises);
};

export const buildFileTree = (files: FileInfo[]): FileTreeNode => {
  const root: FileTreeNode = { name: '프로젝트 루트', type: 'folder', children: [], path: '' };

  for (const file of files) {
    // Skip empty paths that can result from some folder uploads
    if (!file.path) continue;

    const parts = file.path.split('/');
    let currentLevel = root.children!;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;

      const isFile = i === parts.length - 1;
      const fullPath = parts.slice(0, i + 1).join('/');

      let node = currentLevel.find(n => n.name === part);

      if (!node) {
        node = {
          name: part,
          type: isFile ? 'file' : 'folder',
          path: fullPath,
          children: isFile ? undefined : [],
        };
        currentLevel.push(node);
      }

      if (node.type === 'folder' && node.children) {
        currentLevel = node.children;
      }
    }
  }

  const sortNodes = (nodes: FileTreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach(node => {
      if (node.children) {
        sortNodes(node.children);
      }
    });
  };

  if (root.children) {
    sortNodes(root.children);
  }
  
  return root;
};

export const filterFileTree = (node: FileTreeNode, extension: string): FileTreeNode | null => {
  if (node.type === 'file') {
    const fileExt = node.name.split('.').pop() || '';
    return fileExt.toLowerCase() === extension.toLowerCase() ? node : null;
  }

  if (node.type === 'folder' && node.children) {
    const filteredChildren = node.children
      .map(child => filterFileTree(child, extension))
      .filter((child): child is FileTreeNode => child !== null);

    if (filteredChildren.length > 0) {
      return { ...node, children: filteredChildren };
    }
  }
  return null;
};
