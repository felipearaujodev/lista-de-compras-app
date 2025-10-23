import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { adicionarProduto, buscarProdutos, deletarProduto, initDatabase } from '../database/produtoDB';

  interface Produto {
    id: number;
    nome: string;
    criado_em?: string;
  }

const ProdutosScreen = () => {
  const [itens, setItens] = useState<Produto[]>([]);
  const [busca, setBusca] = useState('');
  const [modalVisivel, setModalVisivel] = useState(false);
  const [novoProduto, setNovoProduto] = useState({
    nome: ''
  });
  const [carregando, setCarregando] = useState(true);

  // Inicializar banco e carregar produtos
  useEffect(() => {
  const inicializar = async () => {
    try {
      const sucesso = initDatabase(); // Agora é síncrono
      if (sucesso) {
        await carregarProdutos();
      } else {
        Alert.alert('Erro', 'Falha ao inicializar banco de dados');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao inicializar aplicação');
    } finally {
      setCarregando(false);
    }
  };
  
  inicializar();
}, []);

// Carregar produtos do banco
  const carregarProdutos = async (filtro: string = '') => {
    try {
      const produtos = await buscarProdutos(filtro);
      setItens(produtos);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar produtos');
    }
  };

  // Atualizar lista quando busca mudar
  useEffect(() => {
    carregarProdutos(busca);
  }, [busca]);

  const adicionarItem = () => {
    setModalVisivel(true);
  };

  const salvarProduto = async () => {
    // Validações
    if (!novoProduto.nome.trim()) {
      Alert.alert('Erro', 'Por favor, digite o nome do produto');
      return;
    }

    try {
      const produtoData = {
        nome: novoProduto.nome.trim()
      };

      await adicionarProduto(produtoData);
      
      // Limpar formulário e fechar modal
      setNovoProduto({ nome: ''});
      setModalVisivel(false);
      
      // Recarregar lista
      await carregarProdutos(busca);
      
      Alert.alert('Sucesso', 'Produto cadastrado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar produto');
    }
  };

  const excluirProduto = (id: number, nome: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir o produto "${nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletarProduto(id);
              await carregarProdutos(busca);
              Alert.alert('Sucesso', 'Produto excluído com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Falha ao excluir produto');
            }
          }
        }
      ]
    );
  };

  const cancelarCadastro = () => {
    setNovoProduto({ nome: '' });
    setModalVisivel(false);
  };

  const renderItem = ({ item }: { item: Produto }) => (
    <TouchableOpacity 
      style={styles.item}
      onLongPress={() => excluirProduto(item.id, item.nome)}
    >
      <Text style={styles.textoItem}>{item.nome}</Text>
      
      <Text style={styles.textoData}>
        {item.criado_em ? new Date(item.criado_em).toLocaleDateString('pt-BR') : ''}
      </Text>
    </TouchableOpacity>
  );

  if (carregando) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Input de pesquisa */}
      <TextInput
        style={styles.input}
        placeholder="Pesquisar item..."
        value={busca}
        onChangeText={setBusca}
      />

      {/* Lista */}
      <FlatList
        data={itens}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listaContainer}
        ListEmptyComponent={
          <Text style={styles.textoVazio}>
            {busca ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
          </Text>
        }
      />

      {/* Modal do Formulário */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisivel}
        onRequestClose={cancelarCadastro}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Cadastrar Novo Produto</Text>
            
            <ScrollView style={styles.formContainer}>
              <TextInput
                style={styles.inputForm}
                placeholder="Nome do produto*"
                value={novoProduto.nome}
                onChangeText={(text) => setNovoProduto({...novoProduto, nome: text})}
                autoFocus
              />
            </ScrollView>

            {/* Botões do Modal */}
            <View style={styles.botoesContainer}>
              <TouchableOpacity 
                style={[styles.botao, styles.botaoCancelar]} 
                onPress={cancelarCadastro}
              >
                <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.botao, styles.botaoSalvar]} 
                onPress={salvarProduto}
              >
                <Text style={styles.textoBotaoSalvar}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Botão flutuante */}
      <TouchableOpacity style={styles.botaoFlutuante} onPress={adicionarItem}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop: 50,
  },
  input: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  listaContainer: {
    paddingBottom: 20,
  },
  item: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 15,
    borderRadius: 10,
    elevation: 1,
  },
  textoItem: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  textoDetalhe: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  textoData: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  textoVazio: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  botaoFlutuante: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    backgroundColor: '#007bff',
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    maxHeight: 300,
  },
  inputForm: {
    backgroundColor: '#f8f8f8',
    marginBottom: 15,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  botao: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  botaoCancelar: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  botaoSalvar: {
    backgroundColor: '#007bff',
  },
  textoBotaoCancelar: {
    color: '#333',
    fontWeight: 'bold',
  },
  textoBotaoSalvar: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ProdutosScreen;
