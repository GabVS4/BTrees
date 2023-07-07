// Definindo a classe Node para representar um nó na árvore B
class Node {
  constructor(leaf = false) {
    this.keys = [];
    this.children = [];
    this.leaf = leaf;
  }
}

// Definindo a classe BTree para representar a árvore B
class BTree {
  constructor(t) {
    this.root = new Node(true);
    this.t = t;
  }

  // Função para inserir uma chave na árvore B
  insert(key) {
    let root = this.root;
    if (root.keys.length === (2 * this.t) - 1) {
      let newRoot = new Node();
      this.root = newRoot;
      newRoot.children[0] = root;
      this.splitChild(newRoot, 0);
      this.insertNonFull(newRoot, key);
    } else {
      this.insertNonFull(root, key);
    }
  }

  // Função auxiliar para inserir uma chave em um nó não cheio
  insertNonFull(node, key) {
    let i = node.keys.length - 1;
    if (node.leaf) {
      while (i >= 0 && key < node.keys[i]) {
        node.keys[i + 1] = node.keys[i];
        i--;
      }
      node.keys[i + 1] = key;
    } else {
      while (i >= 0 && key < node.keys[i]) {
        i--;
      }
      i++;
      if (node.children[i].keys.length === (2 * this.t) - 1) {
        this.splitChild(node, i);
        if (key > node.keys[i]) {
          i++;
        }
      }
      this.insertNonFull(node.children[i], key);
    }
  }

  // Função auxiliar para dividir um filho de um nó cheio
  splitChild(parent, index) {
    let child = parent.children[index];
    let newChild = new Node(child.leaf);
    parent.keys.splice(index, 0, child.keys[this.t - 1]);
    parent.children.splice(index + 1, 0, newChild);
    newChild.keys = child.keys.splice(this.t, child.keys.length - 1);
    if (!child.leaf) {
      newChild.children = child.children.splice(this.t, child.children.length - 1);
    }
  }

  // Função para pesquisar uma chave na árvore B
  search(key) {
    return this.searchNode(this.root, key);
  }

  // Função auxiliar para pesquisar uma chave em um nó
  searchNode(node, key) {
    let i = 0;
    while (i < node.keys.length && key > node.keys[i]) {
      i++;
    }
    if (i < node.keys.length && key === node.keys[i]) {
      alert('Valor encontrado');
      return true;
    } else if (node.leaf) {
      alert('Valor não encontrado');
      return false;
    } else {
      return this.searchNode(node.children[i], key);
    }
  }

  // Função para remover uma chave da árvore B
  remove(key) {
    this.removeKey(this.root, key);

    // Verifica se a raiz ficou vazia após a remoção
    // e, nesse caso, atualiza a raiz da árvore
    if (this.root.keys.length === 0 && !this.root.leaf) {
      this.root = this.root.children[0];
    }
  }

  // Função auxiliar para remover uma chave de um nó
  removeKey(node, key) {
    let index = node.keys.findIndex(k => k === key);

    // Caso a chave esteja presente no nó atual
    if (index !== -1) {
      // Caso o nó seja uma folha, simplesmente remove a chave
      if (node.leaf) {
        node.keys.splice(index, 1);
        return;
      }

      let keyToRemove = node.keys[index];

      let childToLeft = node.children[index];
      let childToRight = node.children[index + 1];

      // Caso o nó filho à esquerda do elemento a ser removido
      // tenha pelo menos t chaves, substitui o elemento pelo
      // seu predecessor e realiza a remoção no filho à esquerda
      if (childToLeft.keys.length >= this.t) {
        let predecessor = this.findPredecessor(childToLeft);
        node.keys[index] = predecessor;
        this.removeKey(childToLeft, predecessor);
      }
      // Caso o nó filho à direita do elemento a ser removido
      // tenha pelo menos t chaves, substitui o elemento pelo
      // seu sucessor e realiza a remoção no filho à direita
      else if (childToRight.keys.length >= this.t) {
        let successor = this.findSuccessor(childToRight);
        node.keys[index] = successor;
        this.removeKey(childToRight, successor);
      }
      // Caso contrário, une os dois nós filhos e realiza a
      // remoção no nó resultante
      else {
        let mergedChild = this.mergeNodes(childToLeft, childToRight);
        node.keys.splice(index, 1);
        node.children.splice(index, 2);
        this.removeKey(mergedChild, keyToRemove);
      }
    }
    // Caso a chave não esteja no nó atual, desce na árvore
    // recursivamente até encontrar o nó correto
    else {
      let nextChildIndex = node.keys.findIndex(k => key < k);
      let nextChild = node.children[nextChildIndex];

      if (nextChild.keys.length === this.t - 1) {
        let leftSibling = node.children[nextChildIndex - 1];
        let rightSibling = node.children[nextChildIndex + 1];

        if (leftSibling && leftSibling.keys.length >= this.t) {
          this.shiftFromRightToLeft(leftSibling, nextChild, nextChildIndex - 1);
          nextChildIndex--;
        } else if (rightSibling && rightSibling.keys.length >= this.t) {
          this.shiftFromLeftToRight(nextChild, rightSibling, nextChildIndex);
        } else if (leftSibling) {
          let mergedChild = this.mergeNodes(leftSibling, nextChild);
          nextChild = mergedChild;
          nextChildIndex--;
        } else if (rightSibling) {
          let mergedChild = this.mergeNodes(nextChild, rightSibling);
          nextChild = mergedChild;
        }
      }

      this.removeKey(nextChild, key);
    }
  }

  // Função auxiliar para encontrar o predecessor de um elemento
  findPredecessor(node) {
    if (node.leaf) {
      return node.keys[node.keys.length - 1];
    }
    return this.findPredecessor(node.children[node.children.length - 1]);
  }

  // Função auxiliar para encontrar o sucessor de um elemento
  findSuccessor(node) {
    if (node.leaf) {
      return node.keys[0];
    }
    return this.findSuccessor(node.children[0]);
  }

  // Função auxiliar para unir dois nós filhos de um nó pai
  mergeNodes(leftChild, rightChild) {
    let mergedNode = new Node();
    mergedNode.keys = leftChild.keys.concat(rightChild.keys);
    mergedNode.children = leftChild.children.concat(rightChild.children);
    return mergedNode;
  }

  // Função auxiliar para mover uma chave do filho da direita para o filho da esquerda
  shiftFromRightToLeft(leftChild, rightChild, leftChildIndex) {
    leftChild.keys.push(rightChild.keys.shift());
    if (!leftChild.leaf) {
      leftChild.children.push(rightChild.children.shift());
    }
    leftChild.keys.sort();
  }

  // Função auxiliar para mover uma chave do filho da esquerda para o filho da direita
  shiftFromLeftToRight(leftChild, rightChild, leftChildIndex) {
    rightChild.keys.unshift(leftChild.keys.pop());
    if (!rightChild.leaf) {
      rightChild.children.unshift(leftChild.children.pop());
    }
    rightChild.keys.sort();
  }

  // Função para percorrer a árvore B e criar a representação visual
  traverseTree(root) {
    const container = document.getElementById('btree-container');
    container.innerHTML = '';
    this.traverseNode(root, container);
  }

  // Função auxiliar para percorrer um nó e criar a representação visual recursivamente
  traverseNode(node, parentElement) {
    const newNodeElement = document.createElement('div');
    newNodeElement.classList.add('node');
    if (node.leaf) {
      newNodeElement.classList.add('leaf');
    }
    newNodeElement.textContent = node.keys.join(', ');

    parentElement.appendChild(newNodeElement);

    if (!node.leaf) {
      for (const child of node.children) {
        this.traverseNode(child, newNodeElement);
      }
    }
  }
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

// Função para gerar um número aleatório dentro de um intervalo
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Função para inserção aleatória de elementos na árvore B+
function insertRandomElements(tree, count, rangeMin, rangeMax) {
  for (let i = 0; i < count; i++) {
    const key = getRandomNumber(rangeMin, rangeMax);
    tree.insert(key);
  }
}

function removeRandomElement(btree) {
  let keys = [];
  traverseTree(btree.root, keys);
  
  if (keys.length === 0) {
    console.log('A árvore está vazia. Nenhum elemento para remover.');
    return;
  }
  
  const randomIndex = getRandomNumber(0, keys.length - 1);
  const randomKey = keys[randomIndex];
  
  btree.remove(randomKey);
  
  console.log(`Elemento removido: ${randomKey}`);
}

window.addEventListener('load', () => {
  let btree = new BTree(3);

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
    btree = new BTree(Number(fanoutElement.value))
  });

  botaoInserir.addEventListener("click", () => {
    const inserir = Number(inserirElement.value);
    btree.insert(inserir);
    btree.traverseTree(btree.root);
  });

  botaoInserirAleatorio.addEventListener("click", () => {
    const menorValor = Number(menorValorElement.value);
    const maiorValor = Number(maiorValorElement.value);
    const inserirAleatorio = Number(inserirAleatorioElement.value);
    const inicio = new Date().getTime()
    insertRandomElements(btree, inserirAleatorio, menorValor, maiorValor);
    const fim = new Date().getTime()
    timer(inicio, fim);
    btree.traverseTree(btree.root);
    read = read + 1;
    write = write + 1 * inserirAleatorio;
    setReadWrite();
    console.log("---------------------------------");
  });

  botaoDeletar.addEventListener("click", () => {
    const deletar = Number(deletarElement.value);
    btree.remove(deletar);
    btree.traverseTree(btree.root);
    console.log("---------------------------------");
  });

  botaoDeletarAleatorio.addEventListener("click", () => {
    const deletarAleatorio = Number(deletarAleatorioElement.value);
    const inicio = new Date().getTime()
    removeRandomElement(btree);
    const fim = new Date().getTime()
    timer(inicio, fim);
    btree.traverseTree(btree.root);
    read = read + 1;
    write = write + 1 * deletarAleatorio;
    setReadWrite();
    console.log("---------------------------------");
  });

  botaoBusca.addEventListener("click", () => {
    const busca = Number(buscaElement.value);
    btree.search(busca);
    btree.traverseTree(btree.root);
    console.log("---------------------------------");
  });
  

})
