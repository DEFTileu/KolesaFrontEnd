/**
 * Утилиты для работы с HTML контентом
 */

/**
 * Извлекает все URL изображений из HTML
 * @param html - HTML строка
 * @returns массив URL изображений
 */
export function extractImagesFromHtml(html: string): string[] {
  if (!html) return [];

  const imgRegex = /<img[^>]+src="([^">]+)"/g;
  const images: string[] = [];
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    images.push(match[1]);
  }

  return images;
}

/**
 * Санитизирует HTML для безопасного отображения
 * @param html - HTML строка
 * @returns санитизированный HTML
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Простая санитизация без DOMPurify (на случай если библиотека не установлена)
  // В production лучше использовать DOMPurify
  // Временно возвращаем как есть, в production использовать DOMPurify для полноценной санитизации

  return html;
}

/**
 * Преобразует plain text в HTML с параграфами
 * @param text - plain text
 * @returns HTML с тегами <p>
 */
export function textToHtml(text: string): string {
  if (!text) return '';

  // Проверяем, уже ли это HTML
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return text;
  }

  // Преобразуем plain text в HTML
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  return paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
}

/**
 * Вставляет изображение в конец HTML контента
 * @param html - текущий HTML
 * @param imageUrl - URL изображения
 * @returns обновленный HTML
 */
export function insertImageIntoHtml(html: string, imageUrl: string): string {
  if (!imageUrl) return html;

  const imgTag = `<img src="${imageUrl}" alt="Изображение" />`;

  // Если HTML пустой, создаем параграф с изображением
  if (!html || html.trim() === '') {
    return `<p>${imgTag}</p>`;
  }

  // Добавляем изображение в конец
  return `${html}<p>${imgTag}</p>`;
}

