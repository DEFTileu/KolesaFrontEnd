# Publications Platform - React Frontend

A pure React.js frontend application that integrates with your Spring Framework backend for managing publications.

## Как запустить проект (RU)

Ниже — краткая инструкция по запуску на локальной машине.

1) Установите Node.js LTS (рекомендуется 18+). Проверьте версию:
   ```bash
   node -v
   npm -v
   ```

2) Установите зависимости (любой менеджер пакетов на ваш выбор):
   - npm: `npm install`
   - pnpm: `pnpm install`
   - yarn: `yarn`

3) Создайте файл окружения и укажите адрес вашего бэкенда Spring Boot:
   - Скопируйте пример:
     - Windows PowerShell: `Copy-Item .env.example .env`
     - Bash: `cp .env.example .env`
   - Отредактируйте `.env` при необходимости. По умолчанию используется локальный бэкенд:
     ```env
     VITE_API_URL=http://localhost:8080/api
     ```
   Убедитесь, что ваш Spring Boot запущен на этом адресе (или поменяйте значение на ваш).

4) Запустите разработку:
   - npm: `npm run dev`
   - pnpm: `pnpm dev`
   - yarn: `yarn dev`

   По умолчанию Vite поднимет сервер на http://localhost:3000 и автоматически откроет браузер.

5) Сборка и предпросмотр прод-версии (по желанию):
   ```bash
   npm run build
   npm run preview
   ```

Подсказки:
- Если порт 3000 занят, либо освободите его, либо задайте другой порт в `vite.config.ts` (параметр `server.port`).
- В проекте присутствуют папки/файлы Next.js, но запуск осуществляется как Vite-приложение (React + Vite). Игнорируйте next-команды; используйте скрипты из `package.json` (`dev`, `build`, `preview`).

## Features

- **Authentication**: Sign in and sign up pages with JWT token management
- **Home Page**: Display all publications in a responsive grid layout
- **Publication Details**: Click on any publication to view full content, images, and author info
- **Responsive Design**: Mobile-first design that works on all screen sizes
- **Type Safety**: Built with TypeScript for better code quality
- **Modern UI**: Using Tailwind CSS with clean, professional styling

## Tech Stack

- **React 18.3** with React Router
- **TypeScript**
- **Vite** (fast build tool)
- **Tailwind CSS**
- **React Router DOM** for navigation

## Getting Started

### Prerequisites

Make sure your Spring Boot backend is running on `http://localhost:8080`

### Installation

1. Download and extract the project
2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

### Configuration

1. Create a `.env` file in the root directory:

\`\`\`bash
cp .env.example .env
\`\`\`

2. Update the API URL if your Spring backend runs on a different port:

\`\`\`env
VITE_API_URL=http://localhost:8080/api
\`\`\`

### Running the App

\`\`\`bash
npm run dev
\`\`\`

The app will open at [http://localhost:3000](http://localhost:3000).

### Build for Production

\`\`\`bash
npm run build
npm run preview
\`\`\`

## API Integration

The frontend expects these Spring Boot endpoints:

### Auth Endpoints
- `POST /api/auth/signin` - Sign in with email and password
  \`\`\`json
  Request: { "email": "user@example.com", "password": "password123" }
  Response: {
    "token": "jwt-token",
    "user": {
      "id": "uuid",
      "username": "user@example.com",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
  \`\`\`

- `POST /api/auth/signup` - Create new user account
  \`\`\`json
  // NOTE: username in the frontend is used as the login name (often equal to email)
  Request: {
    "username": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "password123"
  }
  Response: {
    "token": "jwt-token",
    "user": {
      "id": "uuid",
      "username": "user@example.com",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
  \`\`\`

### Publication Endpoints
- `GET /api/publications` - Get all publications (requires authentication)
- `GET /api/publications/{id}` - Get single publication by ID (requires authentication)

The Publication object the frontend expects (both in list and detail) strictly matches this shape:
\`\`\`json
{
  "id": "uuid",
  "title": "Post title",
  "description": "Short summary",
  "content": "Full markdown or HTML content",
  "author": {
    "id": "uuid",
    "username": "user@example.com",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "createdAt": "2025-01-01T12:34:56Z",
  "updatedAt": "2025-01-02T08:10:00Z",
  "published": true,
  "images": [
    "https://cdn.example.com/uploads/cover1.jpg",
    "https://cdn.example.com/uploads/cover2.jpg"
  ]
}
\`\`\`

All authenticated endpoints require the JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

## Spring Boot Backend Setup

Ensure your Spring Boot application has CORS configured to allow requests from the React app:

\`\`\`java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
\`\`\`

## Project Structure

\`\`\`
├── src/
│   ├── components/
│   │   ├── Navbar.tsx              # Navigation bar with user info and logout
│   │   └── PublicationCard.tsx     # Publication card component
│   ├── pages/
│   │   ├── SignIn.tsx              # Sign in page
│   │   ├── SignUp.tsx              # Sign up page
│   │   ├── Home.tsx                # Publications list page
│   │   └── PublicationDetail.tsx   # Single publication view
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   ├── utils/
│   │   └── api.ts                  # API service functions
│   ├── App.tsx                     # Main app component with routing
│   ├── main.tsx                    # Application entry point
│   └── index.css                   # Global styles and Tailwind
├── index.html                      # HTML template
├── vite.config.ts                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS configuration
└── tsconfig.json                   # TypeScript configuration
\`\`\`

## Key Features

### Authentication Flow
1. User visits the app and is redirected to `/sign-in`
2. After successful authentication, JWT token is stored in localStorage
3. Token is automatically included in all API requests
4. User can logout, which clears the token and redirects to sign-in

### Publications List (Home Page)
- Responsive grid layout (1 column mobile, 2 tablet, 3 desktop)
- Each card shows:
  - Cover image (or placeholder if no image)
  - Title and description
  - Author name
  - Publication date
- Click any card to view full details

### Publication Detail Page
- Full article content with proper typography
- Image gallery if multiple images exist
- Author information
- Timestamps (created and updated)
- Back button to return to home

## Customization

### Change API Base URL

Update `.env`:
\`\`\`env
VITE_API_URL=https://your-api-url.com/api
\`\`\`

### Styling

Colors are defined using CSS variables in `src/index.css`. Modify the `:root` section to change the theme:

\`\`\`css
:root {
  --primary: 217 91% 60%;
  --primary-foreground: 210 40% 98%;
  /* ... other color variables */
}
\`\`\`

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import on [Vercel](https://vercel.com)
3. Add environment variable: `VITE_API_URL`
4. Deploy!

### Deploy to Netlify

1. Push code to GitHub
2. Import on [Netlify](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variable: `VITE_API_URL`

## Troubleshooting

### CORS Errors
Make sure your Spring Boot backend has CORS properly configured (see Spring Boot Backend Setup section above).

### API Connection Issues
- Check that your Spring Boot backend is running
- Verify the `VITE_API_URL` in your `.env` file is correct
- Check browser console for detailed error messages

### Authentication Issues
- JWT tokens are stored in localStorage
- Check Application tab in browser DevTools to see if token is stored
- Verify your Spring Boot JWT configuration matches the frontend expectations

## License

This project is provided as-is for integration with your Spring Framework backend.


## Profile API (RU)

Ниже описано, какие данные ожидает фронтенд при работе с профилем пользователя. Все запросы требуют заголовок авторизации:

Authorization: Bearer <JWT>

1) GET /api/users/profile — получить текущий профиль
- Response (UserDTO):
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "user@example.com",
  "name": "John Doe",            // опционально
  "firstName": "John",           // опционально
  "lastName": "Doe",             // опционально
  "role": "USER",                // опционально
  "avatarUrl": "https://cdn.example.com/u/123.jpg", // может быть null
  "createdAt": "2025-01-01T12:00:00Z",             // опционально
  "updatedAt": "2025-01-05T09:30:00Z"              // опционально
}

Поля firstName/lastName предпочтительны; если их нет, интерфейс может использовать name или username.

2) PUT /api/users/profile — обновить профиль
- Request body (любые из перечисленных полей, не обязательно все):
{
  "firstName": "John",
  "lastName": "Doe",
  "name": "John Doe",          // если не используете раздельные first/last
  "avatarUrl": "https://..."   // или null, чтобы убрать аватар
}
- Response: Обновленный UserDTO (тот же формат, что в GET /users/profile)

Заметки:
- Все поля в теле запроса опциональны; отправляйте только то, что меняете.
- avatarUrl допускает null, чтобы сбросить аватар.

3) POST /api/auth/change-password — сменить пароль
- Request body:
{
  "currentPassword": "oldPass",
  "newPassword": "newPass123"
}
- Response: 200 OK без тела (или { "message": "Password changed" })

Требования со стороны фронтенда:
- После успешного PUT /users/profile фронтенд ожидает вернуть полный объект пользователя (UserDTO), чтобы мгновенно обновить локальное состояние и localStorage.
- Минимальный набор для корректного отображения в шапке: firstName и/или name, lastName (по возможности), avatarUrl (если есть). При отсутствии аватара интерфейс показывает инициалы на основе firstName/lastName/name.
- Маршруты могут быть смонтированы на префикс /api (VITE_API_URL). Примеры выше указаны с префиксом /api: /api/users/profile, /api/auth/change-password.
