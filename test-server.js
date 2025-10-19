#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

// MIME типы
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - ${req.method} ${req.url} from ${req.headers.origin || 'unknown origin'}`);

    // CORS заголовки для всех запросов
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    // Обработка preflight запросов
    if (req.method === 'OPTIONS') {
        console.log(`  ✅ CORS preflight request accepted`);
        res.writeHead(200);
        res.end();
        return;
    }

    let filePath = req.url === '/' ? '/test-production.html' : req.url;
    filePath = path.join(__dirname, filePath);

    // Проверяем существование файла
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.log(`  ❌ File not found: ${filePath}`);
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <html>
                    <head><title>404 - Файл не найден</title></head>
                    <body>
                        <h1>404 - Файл не найден</h1>
                        <p>Запрошенный файл не найден: ${req.url}</p>
                        <p><a href="/">Вернуться к тестовой странице</a></p>
                    </body>
                </html>
            `);
            return;
        }

        // Определяем MIME тип
        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        // Читаем и отправляем файл
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.log(`  ❌ Error reading file: ${err.message}`);
                res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`
                    <html>
                        <head><title>500 - Ошибка сервера</title></head>
                        <body>
                            <h1>500 - Ошибка сервера</h1>
                            <p>Ошибка при чтении файла: ${err.message}</p>
                        </body>
                    </html>
                `);
                return;
            }

            console.log(`  ✅ Sending ${path.basename(filePath)} (${contentType})`);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    });
});

server.listen(PORT, () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Локальный HTTP сервер для тестирования API`);
    console.log(`${'='.repeat(60)}`);
    console.log(`\n📍 Сервер запущен на: http://localhost:${PORT}`);
    console.log(`📄 Тестовая страница: http://localhost:${PORT}`);
    console.log(`\n🔗 Подключение к API:`);
    console.log(`   REST API: https://mypns.com/api/v1`);
    console.log(`   GraphQL:  https://mypns.com/graphql`);
    console.log(`\n✅ CORS поддержка включена для всех источников`);
    console.log(`\n⏹️  Нажмите Ctrl+C для остановки сервера\n`);
});

// Обработка завершения процесса
process.on('SIGINT', () => {
    console.log('\n\n🛑 Получена команда остановки (Ctrl+C)...');
    server.close(() => {
        console.log('✅ Сервер остановлен');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n\n🛑 Получен сигнал завершения процесса...');
    server.close(() => {
        console.log('✅ Сервер остановлен');
        process.exit(0);
    });
});
