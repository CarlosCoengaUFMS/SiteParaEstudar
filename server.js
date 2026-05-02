const express = require('express');
const cors = require('cors');
const { execSync, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Rota de compilação
app.post('/compilar', (req, res) => {
    const { code, input } = req.body;
    
    if (!code || typeof code !== 'string') {
        return res.json({ 
            error: 'Código fonte não fornecido', 
            output: '', 
            success: false 
        });
    }
    
    // Cria diretório temporário
    const id = Math.random().toString(36).substring(7);
    const tmpDir = path.join('/tmp', `c_${id}`);
    
    try {
        // Cria diretório
        fs.mkdirSync(tmpDir, { recursive: true });
        
        // Arquivos
        const sourceFile = path.join(tmpDir, 'program.c');
        const outputFile = path.join(tmpDir, 'program');
        
        // Salva código
        fs.writeFileSync(sourceFile, code, 'utf8');
        
        // ========== COMPILAÇÃO ==========
        try {
            execSync(`gcc "${sourceFile}" -o "${outputFile}" -Wall -lm`, {
                encoding: 'utf8',
                timeout: 10000,
                stdio: 'pipe'
            });
        } catch (compileError) {
            // Limpa e retorna erro
            fs.rmSync(tmpDir, { recursive: true, force: true });
            return res.json({
                error: compileError.stderr || compileError.message || 'Erro de compilação',
                output: '',
                success: false
            });
        }
        
        // ========== EXECUÇÃO ==========
        let programOutput = '';
        let programError = '';
        
        try {
            const options = {
                encoding: 'utf8',
                timeout: 5000,
                maxBuffer: 1024 * 1024,
                cwd: tmpDir
            };
            
            // Se tem input, passa via stdin
            if (input && input.trim()) {
                options.input = input;
            }
            
            programOutput = execFileSync(outputFile, [], options);
            
        } catch (execError) {
            programOutput = execError.stdout || '';
            programError = execError.stderr || '';
            
            if (execError.killed || execError.signal === 'SIGTERM') {
                programError = 'Erro: Tempo limite excedido (5 segundos)';
            }
        }
        
        // Limpa diretório temporário
        fs.rmSync(tmpDir, { recursive: true, force: true });
        
        // Retorna resultado
        res.json({
            error: programError.replace(/\/tmp\/[^\s]+/g, '[arquivo]'),
            output: programOutput,
            success: !programError
        });
        
    } catch (error) {
        // Limpa em caso de erro
        try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
        
        res.status(500).json({
            error: 'Erro interno: ' + error.message,
            output: '',
            success: false
        });
    }
});

// Health check
app.get('/ping', (req, res) => {
    try {
        execSync('gcc --version', { encoding: 'utf8', timeout: 3000 });
        res.json({ 
            status: 'online', 
            gcc: true, 
            timestamp: new Date().toISOString(),
            message: 'Compilador C Online - SiteParaEstudar'
        });
    } catch (e) {
        res.json({ status: 'error', gcc: false, error: e.message });
    }
});

// Rota raiz
app.get('/', (req, res) => {
    res.send(`
        <h1>🚀 Compilador C - API</h1>
        <p>Endpoints:</p>
        <ul>
            <li>POST /compilar - Compila código C</li>
            <li>GET /ping - Verifica status</li>
        </ul>
        <p>Use o frontend em: <a href="https://SEU-USER.github.io/SiteParaEstudar/compilador-c.html">SiteParaEstudar</a></p>
    `);
});

// Inicia servidor
app.listen(PORT, () => {
    console.log('═══════════════════════════');
    console.log('🚀 Compilador C - Railway');
    console.log('📡 Porta:', PORT);
    console.log('📝 POST /compilar');
    console.log('💚 GET  /ping');
    console.log('═══════════════════════════');
    
    // Testa GCC
    try {
        const v = execSync('gcc --version', { encoding: 'utf8' });
        console.log('✅ GCC:', v.split('\n')[0]);
    } catch (e) {
        console.log('❌ GCC não encontrado');
    }
});