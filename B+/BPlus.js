// Classe que representa um nó da árvore B+
class BPlusTreeNode {
    constructor(isLeaf = false) {
      this.keys = [];
      this.children = [];
      this.isLeaf = isLeaf;
      this.next = null;
    }
  
    // Insere uma nova chave e valor no nó
    insert(key, value) {
      let index = this.keys.findIndex(k => k > key);
      if (index === -1) {
        index = this.keys.length;
      }
  
      this.keys.splice(index, 0, key);
      this.children.splice(index, 0, value);
    }
  }
  
  // Classe que representa a árvore B+
  class BPlusTree {
    constructor(fanout) {
      if (fanout < 3 || fanout > 10) {
        alert('O fator de ramificação (fanout) deve estar entre 3 e 10.')
        throw new Error('O fator de ramificação (fanout) deve estar entre 3 e 10.');
      }
  
      this.fanout = fanout;
      this.root = new BPlusTreeNode(true);
    }
  
    // Insere uma nova chave e valor na árvore B+
    insert(key, value) {
      const newNode = this._insert(key, value, this.root);
      if (newNode) {
        const oldRoot = this.root;
        this.root = new BPlusTreeNode();
        this.root.insert(newNode.keys[0], newNode);
        this.root.insert(oldRoot.keys[0], oldRoot);
      }
    }
  
    _insert(key, value, node) {
      if (node.isLeaf) {
        node.insert(key, value);
        if (node.keys.length <= this.fanout) {
          return null;
        }
        return this._splitLeafNode(node);
      }
  
      const index = node.keys.findIndex(k => k > key);
      const newNode = this._insert(key, value, node.children[index]);
  
      if (newNode) {
        node.insert(newNode.keys[0], newNode);
        if (node.keys.length > this.fanout) {
          return this._splitNonLeafNode(node);
        }
      }
  
      return null;
    }
  
    _splitLeafNode(node) {
      const mid = Math.ceil(node.keys.length / 2);
      const newKeys = node.keys.splice(mid);
      const newValues = node.children.splice(mid);
      const newLeafNode = new BPlusTreeNode(true);
      newLeafNode.keys = newKeys;
      newLeafNode.children = newValues;
      newLeafNode.next = node.next;
      node.next = newLeafNode;
      return newLeafNode;
    }
  
    _splitNonLeafNode(node) {
      const mid = Math.ceil(node.keys.length / 2);
      const newKeys = node.keys.splice(mid);
      const newChildren = node.children.splice(mid);
      const newNode = new BPlusTreeNode();
      newNode.keys = newKeys;
      newNode.children = newChildren;
      return newNode;
    }
  }

  // Função para gerar um número aleatório dentro de um intervalo
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  // Função para inserção aleatória de elementos na árvore B+
  function insertRandomElements(tree, count, rangeMin, rangeMax) {
    for (let i = 0; i < count; i++) {
      const key = getRandomNumber(rangeMin, rangeMax);
      const value = `Valor ${key}`;
      tree.insert(key, value);
    }
  }

// Função para busca de um elemento na árvore B+
function search(tree, key) {
    let node = tree.root;
  
    while (!node.isLeaf) {
      const index = node.keys.findIndex(k => k > key);
      node = node.children[index];
    }
  
    const index = node.keys.findIndex(k => k == key);
    if (index !== -1) {
      alert('Valor encontrado')
      return node.children[index];
    } else {
      alert('Valor não encontrado')
      return null;
    }
  }

  // Função auxiliar para encontrar o pai de um nó na árvore B+
  function getParent(root, node) {
    let parent = null;
  
    function dfs(currentNode) {
      if (currentNode.children.includes(node)) {
        parent = currentNode;
        return;
      }
  
      if (!currentNode.isLeaf) {
        currentNode.children.forEach(child => dfs(child));
      }
    }
  
    dfs(root);
    return parent;
  }
  
// Função para deletar um valor da árvore B+
function deleteValue(tree, key) {
    let node = tree.root;
    let index;
  
    while (!node.isLeaf) {
      index = node.keys.findIndex(k => k > key);
      node = node.children[index];
    }
  
    index = node.keys.findIndex(k => k === key);
    if (index !== -1) {
      node.keys.splice(index, 1);
      node.children.splice(index, 1);
  
      // Ajustar a árvore, se necessário
      if (node.keys.length < Math.ceil(tree.fanout / 2) && node !== tree.root) {
        const parent = getParent(tree.root, node);
        const siblingIndex = parent.children.indexOf(node) - 1;
        const sibling = parent.children[siblingIndex];
  
        if (sibling && sibling.keys.length > Math.ceil(tree.fanout / 2)) {
          // Empréstimo do irmão anterior
          const borrowedKey = sibling.keys.pop();
          const borrowedChild = sibling.children.pop();
          node.keys.unshift(borrowedKey);
          node.children.unshift(borrowedChild);
          parent.keys[siblingIndex] = node.keys[0];
        } else {
          // Fusão com o irmão anterior
          const mergedKeys = sibling ? sibling.keys.concat(node.keys) : node.keys;
          const mergedChildren = sibling ? sibling.children.concat(node.children) : node.children;
  
          parent.keys.splice(siblingIndex, 1);
          parent.children.splice(siblingIndex, 1);
  
          sibling.keys = mergedKeys;
          sibling.children = mergedChildren;
  
          if (parent.keys.length === 0) {
            // Atualizar a raiz da árvore
            tree.root = sibling;
          }
        }
      }
    }
  }

// Função auxiliar para obter todos os nós folha da árvore B+
function getAllLeafNodes(node) {
    const leafNodes = [];
  
    function traverse(currentNode) {
      if (currentNode.isLeaf) {
        leafNodes.push(currentNode);
      } else {
        currentNode.children.forEach(child => traverse(child));
      }
    }
  
    traverse(node);
    return leafNodes;
  }

// Função para escolher um valor aleatório de um ArrayList
function getRandomValueFromList(list) {
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}
  
// Função para percorrer a árvore B+ e adicionar os valores das chaves em um ArrayList
function traverseKeysToList(tree) {
  const keys = [];

  function traverse(node) {
    node.keys.forEach(key => {
      keys.push(key);
    });

    if (!node.isLeaf) {
      node.children.forEach(child => traverse(child));
    }
  }

  traverse(tree.root);
  return keys;
}

// Função para deletar um valor de um ArrayList
function deleteValueFromList(list, value) {
  const index = list.indexOf(value);
  if (index !== -1) {
    list.splice(index, 1);
    return true;
  }
  return false;
}

// Função para deletar nós aleatórios da árvore B+
function deleteRandomNodes(tree, count) {
  const valuesList = traverseKeysToList(tree);
  console.log(valuesList);
    while(count != 0){
      const randomElement = getRandomValueFromList(valuesList, count);
      deleteValue(tree, randomElement);
      deleteValueFromList(valuesList, randomElement);
      count = count -1;
    }
  }

// Função para percorrer a árvore B+ e gerar a representação em HTML
function traverseTreeHTML(node, depth = 0) {
  let html = '<div class="node" style="margin-left: ' + depth * 20 + 'px;">';
  html += node.keys.join(', ');

  if (!node.isLeaf) {
    html += '<div class="children">';
    for (let i = 0; i < node.children.length; i++) {
      html += traverseTreeHTML(node.children[i], depth + 1);
    }
    html += '</div>';
  }

  html += '</div>';
  return html;
}

var write = 0;
var read = 0;

function setReadWrite (){
  document.getElementById('read').innerText = 'Quantidade de leituras: ' + String(read);
  document.getElementById('write').innerText = 'Quantidade de escritas: ' + String(write);
}

function timer(inicio, fim){
  document.getElementById('timer').innerText = 'Tempo de execução: ' + String(fim-inicio);
}

window.addEventListener("load", () => {
  console.log("page is fully loaded");

  let bPlusTree = new BPlusTree(5);

  const botaoFonout = document.querySelector("#botaoFonout");
  const botaoInserir = document.querySelector("#botaoInserir");
  const botaoInserirAleatorio = document.querySelector("#botaoInserirAleatorio");
  const botaoDeletar = document.querySelector("#botaoDeletar");
  const botaoDeletarAleatorio = document.querySelector("#botaoDeletarAleatorio");
  const botaoBusca = document.querySelector("#botaoBusca");

  const fanoutElement = document.querySelector("#fonout");
  const inserirElement = document.querySelector("#inserir");
  const inserirAleatorioElement = document.querySelector("#inserirAleatorio");
  const menorValorElement = document.querySelector("#valorMinimo");
  const maiorValorElement = document.querySelector("#valorMaximo");
  const deletarElement = document.querySelector("#deletar");
  const deletarAleatorioElement = document.querySelector("#deletarAleatorio");
  const buscaElement = document.querySelector("#busca");

  botaoFonout.addEventListener("click", () => {
    bPlusTree = new BPlusTree(Number(fanoutElement.value))
  });

  botaoInserir.addEventListener("click", () => {
    const inserir = Number(inserirElement.value);
    new Date().getTime()
    bPlusTree.insert(inserir, `ponteiro ${inserir}`);
    new Date().getTime()
    const treeElement = document.getElementById('tree');
    treeElement.innerHTML = traverseTreeHTML(bPlusTree.root);
    console.log("---------------------------------");
  });

  botaoInserirAleatorio.addEventListener("click", () => {
    const menorValor = Number(menorValorElement.value);
    const maiorValor = Number(maiorValorElement.value);
    const inserirAleatorio = Number(inserirAleatorioElement.value);
    const inicio = new Date().getTime()
    insertRandomElements(bPlusTree, inserirAleatorio, menorValor, maiorValor);
    const fim = new Date().getTime()
    timer(inicio, fim);
    const treeElement = document.getElementById('tree');
    treeElement.innerHTML = traverseTreeHTML(bPlusTree.root);
    read = read + 1;
    write = write + 1 * inserirAleatorio;
    setReadWrite();
    console.log("---------------------------------");
  });

  botaoDeletar.addEventListener("click", () => {
    const deletar = Number(deletarElement.value);
    deleteValue(bPlusTree, deletar);
    const treeElement = document.getElementById('tree');
    treeElement.innerHTML = traverseTreeHTML(bPlusTree.root);
    console.log("---------------------------------");
  });

  botaoDeletarAleatorio.addEventListener("click", () => {
    const deletarAleatorio = Number(deletarAleatorioElement.value);
    const inicio = new Date().getTime()
    deleteRandomNodes(bPlusTree, deletarAleatorio);
    const fim = new Date().getTime()
    timer(inicio, fim);
    const treeElement = document.getElementById('tree');
    treeElement.innerHTML = traverseTreeHTML(bPlusTree.root);
    read = read + 1;
    write = write + 1 * deletarAleatorio;
    setReadWrite();
    console.log("---------------------------------");
  });

  botaoBusca.addEventListener("click", () => {
    const busca = Number(buscaElement.value);
    const result = search(bPlusTree, busca);
    console.log("---------------------------------");
  });

});
