import { Product, GitHubConfig } from "../types";
import { DEFAULT_PRODUCTS } from "../data/defaultCatalog";

// UTF-8 safe Base64 decoding
export function decodeBase64UTF8(base64: string): string {
  try {
    const binaryString = atob(base64.replace(/\s/g, ""));
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new TextDecoder("utf-8").decode(bytes);
  } catch (error) {
    console.error("Error decoding base64:", error);
    throw new Error("No se pudo decodificar el contenido del archivo desde GitHub.");
  }
}

// UTF-8 safe Base64 encoding
export function encodeBase64UTF8(str: string): string {
  try {
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch (error) {
    console.error("Error encoding base64:", error);
    throw new Error("No se pudo codificar el contenido para enviar a GitHub.");
  }
}

// Generates the standard headers for GitHub API
function getHeaders(token?: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (token && token.trim() !== "") {
    headers["Authorization"] = `token ${token.trim()}`;
  }
  return headers;
}

/**
 * Fetches the catalog file from GitHub with robust error handling and auto-initialization
 */
export async function fetchGitHubFile(config: GitHubConfig): Promise<{ 
  products: Product[]; 
  sha: string; 
  wasAutoCreated?: boolean; 
  isNotFound?: boolean; 
}> {
  const { owner, repo, branch, filePath, token } = config;
  
  if (!owner || !repo || !filePath) {
    throw new Error("Configuración de GitHub incompleta (Usuario, Repositorio o Ruta de archivo faltante).");
  }

  const cleanFilePath = filePath.trim().replace(/^\/+/, "");
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanFilePath}?ref=${branch || "main"}`;
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(token),
      cache: "no-store",
    });

    if (response.status === 404) {
      console.warn(`Archivo '${cleanFilePath}' no encontrado en GitHub (404). Intentando crear o retornar catálogo por defecto...`);
      
      // Si tenemos Token de GitHub, intentamos crear automáticamente el catalog.json en el repositorio
      if (token && token.trim() !== "") {
        try {
          const defaultCatalog = DEFAULT_PRODUCTS;
          const created = await commitGitHubFile(
            config, 
            defaultCatalog, 
            null, 
            `Inicializar ${cleanFilePath} automáticamente`
          );
          return {
            products: defaultCatalog,
            sha: created.sha,
            wasAutoCreated: true
          };
        } catch (createErr) {
          console.warn("No se pudo crear automáticamente el catalog.json en GitHub:", createErr);
        }
      }

      // Si no se pudo crear o no hay token, se retorna el catálogo base de forma limpia para no romper la app
      return {
        products: DEFAULT_PRODUCTS,
        sha: "",
        isNotFound: true
      };
    }

    if (!response.ok) {
      const errText = await response.text();
      let message = "Error al conectar con GitHub.";
      if (response.status === 401) {
        message = "Token de GitHub inválido o expirado.";
      } else {
        try {
          const errJson = JSON.parse(errText);
          message = errJson.message || message;
        } catch {
          // ignore
        }
      }
      throw new Error(message);
    }

    const data = await response.json();
    
    if (Array.isArray(data)) {
      throw new Error("La ruta especificada apunta a un directorio, no a un archivo JSON.");
    }

    if (data.type !== "file") {
      throw new Error("El recurso solicitado en GitHub no es un archivo válido.");
    }

    const jsonContent = decodeBase64UTF8(data.content);
    
    if (!jsonContent || jsonContent.trim() === "") {
      return {
        products: DEFAULT_PRODUCTS,
        sha: data.sha,
      };
    }

    try {
      const products = JSON.parse(jsonContent);
      if (!Array.isArray(products)) {
        throw new Error("El contenido del archivo JSON de GitHub no es un arreglo de productos válido.");
      }
      return {
        products,
        sha: data.sha,
      };
    } catch (error: any) {
      throw new Error(`El archivo de GitHub no contiene un JSON válido (${error.message}). Puedes hacer clic en 'Inicializar Archivo JSON en GitHub' para crear una estructura válida.`);
    }
  } catch (error: any) {
    if (error.message) {
      throw error;
    }
    throw new Error("Ocurrió un error inesperado al conectar con GitHub.");
  }
}

/**
 * Checks the SHA of the file on GitHub without fetching full content
 */
export async function checkGitHubFileSHA(config: GitHubConfig): Promise<string | null> {
  const { owner, repo, branch, filePath, token } = config;
  
  if (!owner || !repo || !filePath) return null;

  const cleanFilePath = filePath.trim().replace(/^\/+/, "");
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanFilePath}?ref=${branch || "main"}`;
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(token),
      cache: "no-store",
    });

    if (response.status === 404) {
      return "not_found"; // File doesn't exist yet
    }

    if (!response.ok) return null;

    const data = await response.json();
    return data.sha || null;
  } catch {
    return null;
  }
}

/**
 * Commits updates to GitHub
 */
export async function commitGitHubFile(
  config: GitHubConfig,
  products: Product[],
  sha: string | null,
  commitMessage: string
): Promise<{ sha: string }> {
  const { owner, repo, branch, filePath, token } = config;

  if (!token) {
    throw new Error("Se requiere un Token de Acceso Personal (PAT) para escribir cambios en GitHub.");
  }

  if (!owner || !repo || !filePath) {
    throw new Error("Configuración de GitHub incompleta.");
  }

  const cleanFilePath = filePath.trim().replace(/^\/+/, "");
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanFilePath}`;
  const serializedContent = JSON.stringify(products, null, 2);
  const base64Content = encodeBase64UTF8(serializedContent);

  const body: Record<string, any> = {
    message: commitMessage || "Actualización de catálogo desde aplicación web",
    content: base64Content,
    branch: branch || "main",
  };

  if (sha && sha !== "not_found") {
    body.sha = sha;
  }

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      ...getHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (response.status === 409) {
    throw new Error("Conflicto de sincronización (409 Conflict). El archivo en GitHub ha sido modificado recientemente. Por favor, vuelve a sincronizar antes de guardar.");
  }

  if (!response.ok) {
    const errText = await response.text();
    let message = "Error al subir cambios a GitHub.";
    try {
      const errJson = JSON.parse(errText);
      message = errJson.message || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const data = await response.json();
  return {
    sha: data.content.sha,
  };
}
