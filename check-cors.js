#!/usr/bin/env node

const http = require('http');

const tests = [
    {
        name: 'Health endpoint',
        hostname: '81.177.136.22',
        port: 4000,
        path: '/health',
        method: 'GET'
    },
    {
        name: 'Auth register (OPTIONS preflight)',
        hostname: '81.177.136.22',
        port: 4000,
        path: '/api/v1/auth/register',
        method: 'OPTIONS',
        headers: {
            'Origin': 'http://localhost:8080',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
        }
    },
    {
        name: 'Auth register (POST)',
        hostname: '81.177.136.22',
        port: 4000,
        path: '/api/v1/auth/register',
        method: 'POST',
        headers: {
            'Origin': 'http://localhost:8080',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: 'test@test.com', password: 'password123' })
    },
    {
        name: 'GraphQL endpoint',
        hostname: '81.177.136.22',
        port: 4002,
        path: '/graphql',
        method: 'OPTIONS',
        headers: {
            'Origin': 'http://localhost:8080',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
        }
    }
];

console.log('\n🔍 Проверка CORS на продакшен сервере\n');
console.log('═'.repeat(80));

let completed = 0;

tests.forEach((test, index) => {
    setTimeout(() => {
        const options = {
            hostname: test.hostname,
            port: test.port,
            path: test.path,
            method: test.method,
            headers: test.headers || {
                'Origin': 'http://localhost:8080'
            },
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            console.log(`\n✅ ${test.name}`);
            console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
            console.log(`   CORS Headers:`);
            
            const corsHeaders = [
                'access-control-allow-origin',
                'access-control-allow-methods',
                'access-control-allow-headers',
                'access-control-allow-credentials'
            ];

            corsHeaders.forEach(header => {
                const value = res.headers[header];
                if (value) {
                    console.log(`     ${header}: ${value}`);
                } else {
                    console.log(`     ${header}: [ОТСУТСТВУЕТ]`);
                }
            });

            completed++;
            if (completed === tests.length) {
                console.log('\n' + '═'.repeat(80));
                console.log('\n📋 Вывод:\n');
                analyzeCORS();
            }
        });

        req.on('error', (error) => {
            console.log(`\n❌ ${test.name}`);
            console.log(`   Ошибка: ${error.message}`);
            
            completed++;
            if (completed === tests.length) {
                console.log('\n' + '═'.repeat(80));
                console.log('\n📋 Вывод:\n');
                analyzeCORS();
            }
        });

        req.on('timeout', () => {
            req.destroy();
            console.log(`\n⏱️ ${test.name}`);
            console.log(`   Timeout: сервер не ответил за 5 секунд`);
            
            completed++;
            if (completed === tests.length) {
                console.log('\n' + '═'.repeat(80));
                console.log('\n📋 Вывод:\n');
                analyzeCORS();
            }
        });

        if (test.body) {
            req.write(test.body);
        }

        req.end();
    }, index * 1000);
});

function analyzeCORS() {
    console.log('1. Если CORS заголовки отсутствуют или не содержат');
    console.log('   "access-control-allow-origin", то проблема в конфигурации');
    console.log('   сервера.\n');
    
    console.log('2. Проверьте переменную окружения CORS_ORIGIN:');
    console.log('   - На продакшене: должна содержать http://localhost:8080');
    console.log('   - На локальной машине: по умолчанию "*"\n');
    
    console.log('3. Если сервер не отвечает, проверьте:');
    console.log('   - Запущены ли контейнеры: docker-compose ps');
    console.log('   - Доступен ли сервер: telnet 81.177.136.22 4000\n');
}


