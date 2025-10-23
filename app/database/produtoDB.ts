import * as SQLite from 'expo-sqlite';

// Abrir database
const db = SQLite.openDatabaseSync('produtos.db');

// Inicializar o banco
export const initDatabase = (): boolean => {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        preco REAL,
        quantidade INTEGER,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Banco de dados inicializado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    return false;
  }
};

// Adicionar produto
export const adicionarProduto = (produto: {
  nome: string;
  preco?: number;
  quantidade?: number;
}): number | null => {
  try {
    const result = db.runSync(
      'INSERT INTO produtos (nome, preco, quantidade) VALUES (?, ?, ?)',
      [produto.nome, produto.preco || null, produto.quantidade || null]
    );
    return result.lastInsertRowId as number;
  } catch (error) {
    console.error('Erro ao adicionar produto:', error);
    return null;
  }
};

// Buscar produtos
export const buscarProdutos = (filtro: string = ''): any[] => {
  try {
    return db.getAllSync(
      `SELECT * FROM produtos 
       WHERE nome LIKE ? 
       ORDER BY criado_em DESC`,
      [`%${filtro}%`]
    );
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
};

// Deletar produto
export const deletarProduto = (id: number): boolean => {
  try {
    db.runSync('DELETE FROM produtos WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    return false;
  }
};

// Atualizar produto (funcionalidade extra)
export const atualizarProduto = (
  id: number, 
  produto: { nome?: string; preco?: number; quantidade?: number }
): boolean => {
  try {
    const updates: string[] = [];
    const values: any[] = [];

    if (produto.nome !== undefined) {
      updates.push('nome = ?');
      values.push(produto.nome);
    }
    if (produto.preco !== undefined) {
      updates.push('preco = ?');
      values.push(produto.preco);
    }
    if (produto.quantidade !== undefined) {
      updates.push('quantidade = ?');
      values.push(produto.quantidade);
    }

    if (updates.length === 0) return false;

    values.push(id);
    
    db.runSync(
      `UPDATE produtos SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return false;
  }
};