// server.js - Compilador C Online (Backend Render)
// Deploy: https://siteparaestudar.onrender.com

const express = require('express');
const cors = require('cors');
const { execSync, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== CONFIGURAÇÃO CORS ==========
// Permite requisições do GitHub Pages e qualquer origem
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
    credentials: false,
    maxAge: 3600
}));

// ========== MIDDLEWARES ==========
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Logging de requisições
app.use((req, res, next) => {
    const start = Date.now();
    const timestamp = new Date().toISOString();
    
    console.log(`[${timestamp}] ${req.method} ${req.path} - Início`);
    
    // Adiciona response time
    const originalSend = res.send;
    res.send = function(data) {
        const duration = Date.now() - start;
        console.log(`[${timestamp}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
        originalSend.call(this, data);
    };
    
    next();
});

// ========== ROTA RAIZ ==========
app.get('/', (req, res) => {
    res.json({
        name: 'Compilador C Online',
        version: '2.0',
        platform: 'Render',
        endpoints: {
            health: '/ping',
            compile: '/compilar (POST)',
            docs: '/docs'
        },
        timestamp: new Date().toISOString()
    });
});

// ========== ROTA PING (Health Check) ==========
app.get('/ping', (req, res) => {
    let gccVersion = 'unknown';
    
    try {
        gccVersion = execSync('gcc --version', { 
            encoding: 'utf8', 
            timeout: 3000 
        }).split('\n')[0] || 'unknown';
    } catch (e) {
        gccVersion = 'GCC não encontrado';
    }
    
    res.json({ 
        status: 'online',
        platform: 'Render',
        gcc: gccVersion,
        node: process.version,
        uptime: process.uptime(),
        memory: process.memoryUsage().heapUsed / 1024 / 1024,
        timestamp: new Date().toISOString()
    });
});

// ========== ROTA COMPILAR (POST) ==========
app.post('/compilar', async (req, res) => {
    console.log('📝 Nova requisição de compilação');
    
    const { code, input } = req.body;
    
    // Validação
    if (!code || typeof code !== 'string') {
        return res.status(400).json({ 
            error: 'Código C não fornecido ou inválido', 
            output: '', 
            success: false 
        });
    }
    
    // Limite de tamanho do código (prevenção)
    if (code.length > 500000) {
        return res.status(400).json({
            error: 'Código muito grande (máximo 500KB)',
            output: '',
            success: false
        });
    }
    
    const tmpDir = path.join('/tmp', `c_${Date.now()}_${Math.random().toString(36).substring(7)}`);
    
    try {
        // Criar diretório temporário
        fs.mkdirSync(tmpDir, { recursive: true });
        
        const sourceFile = path.join(tmpDir, 'program.c');
        const binaryFile = path.join(tmpDir, 'program');
        
        // Salvar código
        fs.writeFileSync(sourceFile, code, 'utf8');
        console.log(`📄 Código salvo: ${sourceFile} (${code.length} caracteres)`);
        
        // ========== COMPILAR ==========
        let compileError = null;
        
        try {
            execSync(`gcc "${sourceFile}" -o "${binaryFile}" -lm -Wall -O2`, {
                encoding: 'utf8',
                timeout: 10000, // 10 segundos
                stdio: 'pipe'
            });
            console.log('✅ Compilação bem-sucedida');
        } catch (error) {
            compileError = error.stderr || error.message || 'Erro de compilação';
            
            // Formatar erro para melhor legibilidade
            compileError = compileError
                .replace(new RegExp(tmpDir + '/', 'g'), '')
                .replace(/program\.c/g, 'main.c');
            
            console.log('❌ Erro de compilação:', compileError.substring(0, 200));
            
            // Limpar arquivos
            try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
            
            return res.json({
                error: compileError,
                output: '',
                success: false,
                compiled: false
            });
        }
        
        // ========== EXECUTAR ==========
        let output = '';
        let execError = null;
        let killed = false;
        
        try {
            const execOptions = {
                encoding: 'utf8',
                timeout: 5000, // 5 segundos
                maxBuffer: 1024 * 1024, // 1MB
                input: input || '',
                env: { ...process.env, LANG: 'C.UTF-8' }
            };
            
            output = execFileSync(binaryFile, [], execOptions);
            console.log(`✅ Execução bem-sucedida (${output.length} caracteres de saída)`);
            
        } catch (error) {
            output = error.stdout || '';
            killed = error.killed || false;
            execError = error.stderr || (killed ? 'Tempo limite excedido (5 segundos)' : 'Erro de execução');
            
            console.log('⚠️ Erro de execução:', execError.substring(0, 200));
        }
        
        // ========== LIMPAR ==========
        try { 
            fs.rmSync(tmpDir, { recursive: true, force: true }); 
            console.log('🧹 Arquivos temporários removidos');
        } catch (e) {
            console.log('⚠️ Erro ao limpar arquivos temporários');
        }
        
        // ========== RESPONDER ==========
        const response = {
            error: execError || '',
            output: output || '',
            success: !execError && !compileError,
            compiled: !compileError,
            executed: !execError,
            killed: killed
        };
        
        console.log('📤 Resposta:', {
            success: response.success,
            compiled: response.compiled,
            executed: response.executed,
            outputLength: output.length,
            errorLength: (execError || '').length
        });
        
        res.json(response);
        
    } catch (error) {
        console.error('💥 Erro interno:', error.message);
        
        // Limpar em caso de erro
        try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
        
        res.status(500).json({
            error: 'Erro interno do servidor: ' + error.message,
            output: '',
            success: false,
            compiled: false,
            executed: false
        });
    }
});

// ========== HANDLER OPTIONS (CORS Preflight) ==========
app.options('/compilar', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.setHeader('Access-Control-Max-Age', '3600');
    res.sendStatus(204);
});

// ========== ROTA 404 ==========
app.use((req, res) => {
    console.log(`❌ 404: ${req.method} ${req.path}`);
    res.status(404).json({ 
        error: 'Rota não encontrada',
        path: req.path,
        method: req.method,
        availableEndpoints: {
            root: '/',
            health: '/ping',
            compile: '/compilar (POST)'
        }
    });
});

// ========== TRATAMENTO DE ERROS GLOBAL ==========
app.use((err, req, res, next) => {
    console.error('💥 Erro não tratado:', err.message);
    res.status(500).json({
        error: 'Erro interno do servidor',
        success: false
    });
});

// ========== INICIAR SERVIDOR ==========
app.listen(PORT, '0.0.0.0', () => {
    console.log('╔══════════════════════════════════════╗');
    console.log('║   🚀 Compilador C Online v2.0       ║');
    console.log('║   📦 Plataforma: Render             ║');
    console.log(`║   🔌 Porta: ${PORT}                      ║`);
    console.log('║   📝 Endpoints:                     ║');
    console.log('║     GET  /     - Status             ║');
    console.log('║     GET  /ping - Health Check       ║');
    console.log('║     POST /compilar - Compilar C     ║');
    console.log('╚══════════════════════════════════════╝');
    
    // Verificar GCC
    try {
        const version = execSync('gcc --version', { 
            encoding: 'utf8', 
            timeout: 5000 
        });
        console.log('✅ GCC Detectado:');
        console.log('   ' + version.split('\n')[0]);
        
        // Verificar bibliotecas
        try {
            execSync('ldconfig -p | grep libm.so', { encoding: 'utf8', timeout: 3000 });
            console.log('✅ Biblioteca libm.so disponível');
        } catch (e) {
            console.log('⚠️  libm.so pode não estar disponível');
        }
        
    } catch (e) {
        console.log('❌ GCC NÃO ENCONTRADO!');
        console.log('   Instale com: apt-get install gcc');
    }
    
    console.log(`\n✨ Pronto para receber requisições!`);
    console.log(`🔗 URL: https://siteparaestudar.onrender.com\n`);
});

// ========== SHUTDOWN GRACEFUL ==========
process.on('SIGTERM', () => {
    console.log('📴 Recebido SIGTERM. Fechando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('📴 Recebido SIGINT. Fechando servidor...');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('💥 Erro não capturado:', error.message);
    console.error(error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Promise rejeitada não tratada:', reason);
});