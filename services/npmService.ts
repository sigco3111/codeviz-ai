import { DependencyInfo } from '../types';

/**
 * Fetches the latest version of a single npm package.
 * @param packageName The name of the package.
 * @returns The latest version string or null if an error occurs.
 */
async function fetchLatestPackageVersion(packageName: string): Promise<string | null> {
  try {
    const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(packageName)}/latest`);
    if (!response.ok) {
      // Don't throw, just return null so one failed package doesn't stop the rest.
      console.warn(`Could not fetch latest version for ${packageName}: ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    return data.version || null;
  } catch (error) {
    console.error(`Error fetching latest version for ${packageName}:`, error);
    return null;
  }
}

/**
 * Strips common semver prefixes like ^ and ~ from a version string.
 * @param version The version string from package.json
 * @returns The cleaned version number.
 */
const cleanVersion = (version: string) => version.replace(/[\^~>=]/g, '');


/**
 * Processes a dependency object from package.json, fetches the latest versions,
 * and returns a structured array of dependency information.
 * @param deps The dependencies or devDependencies object from package.json.
 * @returns A promise that resolves to an array of DependencyInfo.
 */
export async function processDependencies(deps: { [key: string]: string }): Promise<DependencyInfo[]> {
  const dependencyPromises = Object.entries(deps).map(async ([name, version]) => {
    const latestVersion = await fetchLatestPackageVersion(name);
    return {
      name,
      version: cleanVersion(version),
      latestVersion,
    };
  });

  return Promise.all(dependencyPromises);
}
