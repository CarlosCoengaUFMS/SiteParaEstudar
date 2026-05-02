const express = require('express');
const cors = require('cors');
const { execSync, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// ROTA RAIZ - teste básico
app.get('/', (req, res) => {
    res.send('🚀 Compilador C Online - OK');
});

// ROTA PING - health check
app.get('/ping', (req, res) => {
    res.json({ 
        status: 'online', 
        gcc: true,
        timestamp: new Date().toISOString()
    });
});

// ROTA COMPILAR
app.post('/compilar', (req, res) => {
    const { code, input } = req.body;
    
    if (!code) {
        return res.json({ 
            error: 'Código não fornecido', 
            output: '', 
            success: false 
        });
    }
    
    const id = Math.random().toString(36).substr(2, 9);
    const tmpDir = path.join('/tmp', `c_${id}`);
    
    try {
        fs.mkdirSync(tmpDir);
        const src = path.join(tmpDir, 'code.c');
        const out = path.join(tmpDir, 'run');
        fs.writeFileSync(src, code);
        
        // Compilar
        try {
            execSync(`gcc -o "${out}" "${src}" -lm -Wall`, { 
                timeout: 10000,
                stdio: 'pipe',
                encoding: 'utf8'
            });
        } catch (e) {
            fs.rmSync(tmpDir, { recursive: true, force: true });
            return res.json({ 
                error: e.stderr || 'Erro de compilação',
                output: '',
                success: false
            });
        }
        
        // Executar
        let output = '', error = '';
        try {
            output = execFileSync(out, [], {
                timeout: 5000,
                maxBuffer: 1024 * 1024,
                encoding: 'utf8',
                input: input || undefined
            });
        } catch (e) {
            output = e.stdout || '';
            error = e.stderr || (e.killed ? 'Timeout (5s)' : '');
        }
        
        fs.rmSync(tmpDir, { recursive: true, force: true });
        
        res.json({ error, output, success: !error });
        
    } catch (e) {
        try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
        res.status(500).json({ error: 'Erro interno', output: '', success: false });
    }
});

// Tratar erros 404
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada', path: req.path });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📡 http://0.0.0.0:${PORT}`);
    console.log(`💚 http://0.0.0.0:${PORT}/ping`);
    console.log(`📝 http://0.0.0.0:${PORT}/compilar`);
    
    // Testar GCC
    try {
        const v = execSync('gcc --version', { encoding: 'utf8' });
        console.log('✅ GCC encontrado:', v.split('\n')[0]);
    } catch (e) {
        console.log('❌ GCC NÃO encontrado:', e.message);
    }
});