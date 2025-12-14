/**
 * Type definitions for fileUploadHelper
 */

/**
 * Результат загрузки файла
 */
export interface UploadResult {
  url: string;
  projectName: string;
  fileType: string;
}

/**
 * Генерирует токен доступа для загрузки файлов
 * @param projectName - название проекта (например, "kolesa")
 * @param fileType - тип файла (например, "avatar", "publication-images")
 * @returns Base64 закодированный токен
 */
export function generateAccessToken(projectName: string, fileType: string): Promise<string>;

/**
 * Загружает файл в указанный проект
 * @param file - файл для загрузки
 * @param projectName - название проекта (например, "kolesa")
 * @param fileType - тип файла (например, "avatar", "publication-images")
 * @param apiUrl - URL вашего API (по умолчанию "http://localhost:8080")
 * @param authToken - токен аутентификации пользователя (Bearer token)
 * @returns Promise с информацией о загруженном файле
 */
export function uploadFileToProject(
  file: File,
  projectName: string,
  fileType: string,
  apiUrl?: string,
  authToken?: string | null
): Promise<UploadResult>;

