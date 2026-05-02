const express = require('express');
const cors = require('cors');
const { execSync, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Verifica GCC
try {
    const version = execSync('gcc --version', { encoding: 'utf8', timeout: 5000 });
    console.log('✅ GCC:', version.split('\n')[0]);
} catch (e) {
    console.error('❌ GCC não encontrado!');
}

// Rota de compilação
app.post('/compilar', (req, res) => {
    const { code, input } = req.body;
    
    if (!code || typeof code !== 'string') {
        return res.json({ error: 'Código não fornecido', output: '', success: false });
    }
    
    const id = crypto.randomBytes(8).toString('hex');
    const tmpDir = path.join(os.tmpdir(), `c_${id}`);
    
    try {
        fs.mkdirSync(tmpDir, { recursive: true });
        
        const sourceFile = path.join(tmpDir, 'program.c');
        const binaryFile = path.join(tmpDir, 'program');
        
        fs.writeFileSync(sourceFile, code, 'utf8');
        
        // Compila
        try {
            execSync(`gcc "${sourceFile}" -o "${binaryFile}" -Wall -O2 -lm`, {
                timeout: 10000,
                stdio: 'pipe'
            });
        } catch (compileErr) {
            cleanup(tmpDir);
            return res.json({
                error: compileErr.stderr?.toString() || compileErr.message,
                output: '',
                success: false
            });
        }
        
        // Executa
        let output = '';
        let error = '';
        
        try {
            output = execFileSync(binaryFile, [], {
                encoding: 'utf8',
                timeout: 5000,
                maxBuffer: 1024 * 1024,
                input: input || undefined
            });
        } catch (execErr) {
            output = execErr.stdout?.toString() || '';
            error = execErr.stderr?.toString() || '';
            if (execErr.killed) error = 'Tempo limite excedido (5s)';
        }
        
        cleanup(tmpDir);
        
        res.json({
            error: error,
            output: output,
            success: !error
        });
        
    } catch (err) {
        cleanup(tmpDir);
        res.status(500).json({
            error: 'Erro interno: ' + err.message,
            output: '',
            success: false
        });
    }
});

// Health check
app.get('/ping', (req, res) => {
    res.json({ status: 'online', gcc: true, timestamp: new Date().toISOString() });
});

function cleanup(dir) {
    try {
        if (fs.existsSync(dir)) {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    } catch (e) {}
}

app.listen(PORT, () => {
    console.log(`🚀 Compilador C rodando na porta ${PORT}`);
});