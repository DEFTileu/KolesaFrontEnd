/**
 * Помощник для загрузки файлов в другие проекты
 * Используйте этот код на фронтенде ваших проектов
 */

// ВАЖНО: Этот секретный ключ должен совпадать с ключом на бэкенде
const SECRET_KEY = "95e6a68e941573ef7188f07bb213ee05";

/**
 * Генерирует токен доступа для загрузки файлов
 * @param {string} projectName - название проекта (например, "Sigma Finance")
 * @param {string} fileType - тип файла (например, "avatar", "documents")
 * @returns {Promise<string>} - Base64 закодированный токен
 */
async function generateAccessToken(projectName, fileType) {
    const timestamp = Date.now();
    const data = `${projectName}|${fileType}|${timestamp}|${SECRET_KEY}`;

    // Генерируем SHA-256 хеш
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);

    // Конвертируем в Base64
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashBase64 = btoa(String.fromCharCode.apply(null, hashArray));

    // Формат: timestamp|hash
    const token = `${timestamp}|${hashBase64}`;
    return btoa(token);
}

/**
 * Загружает файл в указанный проект
 * @param {File} file - файл для загрузки
 * @param {string} projectName - название проекта (например, "Sigma Finance")
 * @param {string} fileType - тип файла (например, "avatar", "documents")
 * @param {string} apiUrl - URL вашего API (например, "https://api.example.com")
 * @param {string} authToken - токен аутентификации пользователя (Bearer token)
 * @returns {Promise<{url: string, projectName: string, fileType: string}>}
 */
async function uploadFileToProject(file, projectName, fileType, apiUrl = "http://localhost:8080", authToken = null) {
    // Генерируем токен доступа для проекта
    const accessToken = await generateAccessToken(projectName, fileType);

    // Подготавливаем FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectName', projectName);
    formData.append('fileType', fileType);
    formData.append('accessToken', accessToken);



    // Отправляем запрос
    const response = await fetch(`${apiUrl}/api/files/upload-to-project`, {
        method: 'POST',
        // headers: headers,
        body: formData
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка загрузки файла');
    }

    return await response.json();
}

// Экспорт для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateAccessToken, uploadFileToProject };
}

// ES6 экспорт для TypeScript/React
export { generateAccessToken, uploadFileToProject };

// Пример использования:
/*

// Вариант 1: Простой пример с input file
document.getElementById('fileInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const result = await uploadFileToProject(
            file,
            "Sigma Finance",  // Название проекта
            "avatar",          // Тип файла
            "https://your-api.com"  // URL вашего API
        );

        console.log('Файл загружен:', result.url);
        // Теперь можно использовать result.url
    } catch (error) {
        console.error('Ошибка:', error.message);
    }
});

// Вариант 2: React компонент
const FileUploader = () => {
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const result = await uploadFileToProject(
                file,
                "Sigma Finance",
                "avatar",
                process.env.REACT_APP_API_URL
            );

            console.log('URL файла:', result.url);
            // Сохраните URL в state или отправьте на сервер
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <input
            type="file"
            onChange={handleFileUpload}
            accept="image/*"
        />
    );
};

// Вариант 3: Vue компонент
export default {
    methods: {
        async handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            try {
                const result = await uploadFileToProject(
                    file,
                    "Sigma Finance",
                    "avatar",
                    import.meta.env.VITE_API_URL
                );

                console.log('URL файла:', result.url);
            } catch (error) {
                alert(error.message);
            }
        }
    }
}

*/

