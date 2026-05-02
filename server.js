const express = require('express');
const cors = require('cors');
const { execSync, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Configurar CORS para aceitar requisições do GitHub Pages
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

// ✅ Aumentar limite do body
app.use(express.json({ limit: '2mb' }));

// ✅ Middleware para logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// ROTA RAIZ
app.get('/', (req, res) => {
    res.send('🚀 Compilador C Online - OK');
});

// ROTA PING
app.get('/ping', (req, res) => {
    res.json({ 
        status: 'online', 
        gcc: true,
        timestamp: new Date().toISOString()
    });
});

// ✅ ROTA COMPILAR - POST
app.post('/compilar', (req, res) => {
    console.log('📝 Requisição recebida!');
    
    const { code, input } = req.body;
    
    if (!code) {
        return res.status(400).json({ 
            error: 'Código não fornecido', 
            output: '', 
            success: false 
        });
    }
    
    const tmpDir = path.join('/tmp', `c_${Date.now()}`);
    
    try {
        fs.mkdirSync(tmpDir, { recursive: true });
        
        const sourceFile = path.join(tmpDir, 'program.c');
        const binaryFile = path.join(tmpDir, 'program');
        
        fs.writeFileSync(sourceFile, code);
        
        // Compilar
        try {
            execSync(`gcc "${sourceFile}" -o "${binaryFile}" -lm -Wall`, {
                encoding: 'utf8',
                timeout: 10000,
                stdio: 'pipe'
            });
        } catch (compileError) {
            const errMsg = compileError.stderr || compileError.message || 'Erro de compilação';
            fs.rmSync(tmpDir, { recursive: true, force: true });
            return res.json({
                error: errMsg,
                output: '',
                success: false
            });
        }
        
        // Executar
        let output = '';
        let error = '';
        
        try {
            const options = {
                encoding: 'utf8',
                timeout: 5000,
                maxBuffer: 1024 * 1024,
                input: input || ''
            };
            
            output = execFileSync(binaryFile, [], options);
            
        } catch (execError) {
            output = execError.stdout || '';
            error = execError.stderr || (execError.killed ? 'Timeout (5s)' : 'Erro de execução');
        }
        
        // Limpar
        try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
        
        res.json({
            error: error,
            output: output,
            success: !error
        });
        
    } catch (error) {
        try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
        res.status(500).json({
            error: 'Erro interno do servidor',
            output: '',
            success: false
        });
    }
});

// ✅ Handler para OPTIONS (CORS preflight)
app.options('/compilar', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
});

// Tratamento de erro 404
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Rota não encontrada: ' + req.method + ' ' + req.path,
        path: req.path,
        method: req.method
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    
    // Testar GCC
    try {
        const v = execSync('gcc --version', { encoding: 'utf8', timeout: 3000 });
        console.log('✅ GCC:', v.split('\n')[0]);
    } catch (e) {
        console.log('❌ GCC não encontrado');
    }
});