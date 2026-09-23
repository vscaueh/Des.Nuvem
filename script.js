/* =========================================================
   Forno da Vila — aplicação de pedidos de uma pizzaria

   Organização do código:
   1. DADOS        → cardápio, tamanhos, taxas (o que não muda)
   2. ESTADO       → o que muda enquanto o usuário usa a página
   3. CÁLCULOS     → funções que só leem o estado e devolvem valores
   4. AÇÕES        → funções que alteram o estado
   5. RENDERIZAÇÃO → funções que desenham o estado na tela
   6. EVENTOS      → ligam cliques e digitação às ações
   (+ ILUSTRAÇÕES  → desenham as pizzas e bebidas em SVG)

   Regra de ouro: toda ação muda o ESTADO e depois chama a
   RENDERIZAÇÃO. A tela é sempre um reflexo do estado.
   ========================================================= */

/* ---------- 1. DADOS ---------- */

const TAXA_ENTREGA = 6;
const ENTREGA_GRATIS_A_PARTIR_DE = 100;

const TAMANHOS = {
  P: { nome: 'Pequena', fatias: 4 },
  M: { nome: 'Média', fatias: 6 },
  G: { nome: 'Grande', fatias: 8 },
};

const CATEGORIAS = {
  salgada: 'Pizzas salgadas',
  doce: 'Pizzas doces',
  bebida: 'Bebidas',
};

const PAGAMENTOS = {
  pix: 'Pix',
  cartao: 'Cartão na entrega',
  dinheiro: 'Dinheiro',
};

// Pizzas têm um preço por tamanho (precos) e uma lista de ingredientes
// para o desenho (cobertura). Bebidas têm um preço só (preco).
const cardapio = [
  {
    id: 1, categoria: 'salgada', nome: 'Margherita',
    descricao: 'Molho de tomate, muçarela, tomate fatiado e manjericão fresco.',
    precos: { P: 32, M: 39, G: 46 },
    cobertura: [{ tipo: 'tomate', qtd: 5 }, { tipo: 'manjericao', qtd: 7 }],
  },
  {
    id: 2, categoria: 'salgada', nome: 'Calabresa', etiqueta: 'Mais pedida',
    descricao: 'Calabresa fatiada, cebola roxa, azeitonas pretas e orégano.',
    precos: { P: 32, M: 39, G: 46 },
    cobertura: [{ tipo: 'calabresa', qtd: 10 }, { tipo: 'cebola', qtd: 6 }, { tipo: 'azeitona', qtd: 5 }],
  },
  {
    id: 3, categoria: 'salgada', nome: 'Frango com Catupiry',
    descricao: 'Frango desfiado temperado, Catupiry cremoso e milho.',
    precos: { P: 35, M: 42, G: 50 },
    cobertura: [{ tipo: 'catupiry', qtd: 4 }, { tipo: 'frango', qtd: 12 }, { tipo: 'milho', qtd: 16 }],
  },
  {
    id: 4, categoria: 'salgada', nome: 'Portuguesa',
    descricao: 'Presunto, ovos, cebola, ervilha, azeitonas e muçarela.',
    precos: { P: 35, M: 43, G: 51 },
    cobertura: [{ tipo: 'presunto', qtd: 6 }, { tipo: 'ovo', qtd: 3 }, { tipo: 'cebola', qtd: 4 }, { tipo: 'azeitona', qtd: 4 }, { tipo: 'ervilha', qtd: 14 }],
  },
  {
    id: 5, categoria: 'salgada', nome: 'Quatro Queijos', base: 'branca',
    descricao: 'Muçarela, provolone, parmesão e gorgonzola.',
    precos: { P: 37, M: 45, G: 54 },
    cobertura: [{ tipo: 'gorgonzola', qtd: 5 }, { tipo: 'provolone', qtd: 5 }, { tipo: 'parmesao', qtd: 26 }],
  },
  {
    id: 6, categoria: 'salgada', nome: 'Nordestina', etiqueta: 'Receita da casa',
    descricao: 'Carne de sol desfiada, queijo coalho, cebola roxa e cheiro-verde.',
    precos: { P: 39, M: 47, G: 56 },
    cobertura: [{ tipo: 'coalho', qtd: 5 }, { tipo: 'carne', qtd: 10 }, { tipo: 'cebola', qtd: 4 }, { tipo: 'cheiroVerde', qtd: 24 }],
  },
  {
    id: 7, categoria: 'doce', nome: 'Chocolate com Morango', base: 'chocolate',
    descricao: 'Chocolate ao leite derretido e morangos frescos.',
    precos: { P: 34, M: 41, G: 48 },
    cobertura: [{ tipo: 'morango', qtd: 7 }],
  },
  {
    id: 8, categoria: 'doce', nome: 'Romeu e Julieta', base: 'branca',
    descricao: 'Goiabada cremosa derretida sobre muçarela.',
    precos: { P: 30, M: 36, G: 42 },
    cobertura: [{ tipo: 'goiabada', qtd: 7 }],
  },
  {
    id: 9, categoria: 'doce', nome: 'Banana com Canela', base: 'branca',
    descricao: 'Banana caramelizada, canela e açúcar.',
    precos: { P: 29, M: 35, G: 40 },
    cobertura: [{ tipo: 'banana', qtd: 8 }, { tipo: 'canela', qtd: 40 }],
  },
  { id: 10, categoria: 'bebida', nome: 'Refrigerante 2 L', descricao: 'Cola, guaraná ou laranja, bem gelado.', preco: 14, desenho: 'refrigerante' },
  { id: 11, categoria: 'bebida', nome: 'Suco natural 500 ml', descricao: 'Cajá, acerola ou maracujá, feito na hora.', preco: 10, desenho: 'suco' },
  { id: 12, categoria: 'bebida', nome: 'Água mineral 500 ml', descricao: 'Com ou sem gás.', preco: 4, desenho: 'agua' },
];

/* ---------- 2. ESTADO ---------- */

const estado = {
  filtro: 'todas', // categoria visível no cardápio
  tamanhos: {}, // tamanho escolhido de cada pizza, ex.: { 1: 'M' }
  sacola: [], // itens: { chave, id, nome, tamanho, preco, quantidade }
  tipoRecebimento: 'entrega', // 'entrega' ou 'retirada'
  etapa: 'sacola', // etapa do painel lateral: 'sacola' ou 'dados'
};

/* ---------- 3. CÁLCULOS ---------- */

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function formatarPreco(valor) {
  return moeda.format(valor);
}

function buscarItem(id) {
  return cardapio.find((item) => item.id === id);
}

// Pizzas começam no tamanho Grande; bebidas não têm tamanho.
function tamanhoEscolhido(item) {
  if (!item.precos) return null;
  return estado.tamanhos[item.id] || 'G';
}

function precoDe(item, tamanho) {
  return item.precos ? item.precos[tamanho] : item.preco;
}

function descreverItem(item) {
  if (!item.tamanho) return item.nome;
  return `${item.nome} (${TAMANHOS[item.tamanho].nome.toLowerCase()})`;
}

function calcularTotais() {
  const subtotal = estado.sacola.reduce((soma, i) => soma + i.preco * i.quantidade, 0);
  const quantidade = estado.sacola.reduce((soma, i) => soma + i.quantidade, 0);

  const cobraEntrega =
    estado.tipoRecebimento === 'entrega' &&
    subtotal > 0 &&
    subtotal < ENTREGA_GRATIS_A_PARTIR_DE;

  const taxa = cobraEntrega ? TAXA_ENTREGA : 0;
  return { subtotal, quantidade, taxa, total: subtotal + taxa };
}

// Funciona de terça a domingo, das 18h às 23h.
function statusFuncionamento(agora = new Date()) {
  const dia = agora.getDay(); // 0 = domingo, 1 = segunda...
  const hora = agora.getHours();
  const abreHoje = dia !== 1;

  if (abreHoje && hora >= 18 && hora < 23) return { aberto: true, texto: 'Aberto agora, até 23h' };
  if (abreHoje && hora < 18) return { aberto: false, texto: 'Abre hoje às 18h' };

  const amanha = (dia + 1) % 7;
  return { aberto: false, texto: amanha === 1 ? 'Abre terça às 18h' : 'Abre amanhã às 18h' };
}

/* ---------- 4. AÇÕES ---------- */

function escolherFiltro(filtro) {
  estado.filtro = filtro;
  renderizarFiltros();
  renderizarCardapio();
}

function escolherTamanho(id, tamanho) {
  estado.tamanhos[id] = tamanho;
  atualizarCard(id);
}

function adicionarNaSacola(id) {
  const item = buscarItem(id);
  const tamanho = tamanhoEscolhido(item);

  // A mesma pizza em tamanhos diferentes vira linhas diferentes na sacola.
  const chave = tamanho ? `${id}-${tamanho}` : String(id);
  const existente = estado.sacola.find((i) => i.chave === chave);

  if (existente) {
    existente.quantidade += 1;
  } else {
    estado.sacola.push({ chave, id, nome: item.nome, tamanho, preco: precoDe(item, tamanho), quantidade: 1 });
  }

  renderizarSacola();
  pulsarContador();
  mostrarToast(`${descreverItem({ nome: item.nome, tamanho })} foi para a sacola`);
}

function alterarQuantidade(chave, diferenca) {
  const item = estado.sacola.find((i) => i.chave === chave);
  if (!item) return;

  item.quantidade += diferenca;
  if (item.quantidade <= 0) {
    estado.sacola = estado.sacola.filter((i) => i.chave !== chave);
  }

  renderizarSacola();
}

function mudarTipoRecebimento(tipo) {
  estado.tipoRecebimento = tipo;
  atualizarCamposDoFormulario();
  renderizarSacola();
}

function abrirSacola() {
  esconderToast();
  irParaEtapa('sacola');
  el.gaveta.showModal();
}

function irParaEtapa(etapa) {
  estado.etapa = etapa;
  const naSacola = etapa === 'sacola';
  el.etapaSacola.hidden = !naSacola;
  el.form.hidden = naSacola;
  el.voltar.hidden = naSacola;
  el.gavetaTitulo.textContent = naSacola ? 'Sua sacola' : 'Finalizar pedido';
}

function reiniciarPedido() {
  estado.sacola = [];
  estado.tamanhos = {};
  estado.tipoRecebimento = 'entrega';

  el.form.reset();
  limparErros();
  atualizarCamposDoFormulario();
  renderizarCardapio();
  renderizarSacola();
  window.scrollTo({ top: 0 });
}

/* ---------- 5. RENDERIZAÇÃO ---------- */

// Guardamos os elementos da página uma vez só.
const el = {
  selo: document.getElementById('selo'),
  seloTexto: document.getElementById('selo-texto'),
  heroPizza: document.getElementById('hero-pizza'),
  filtros: document.getElementById('filtros'),
  listaCardapio: document.getElementById('lista-cardapio'),
  contador: document.getElementById('contador'),
  abrirSacola: document.getElementById('abrir-sacola'),
  gaveta: document.getElementById('gaveta'),
  gavetaTitulo: document.getElementById('gaveta-titulo'),
  voltar: document.getElementById('voltar'),
  fecharGaveta: document.getElementById('fechar-gaveta'),
  etapaSacola: document.getElementById('etapa-sacola'),
  sacolaVazia: document.getElementById('sacola-vazia'),
  pizzaVazia: document.getElementById('pizza-vazia'),
  irCardapio: document.getElementById('ir-cardapio'),
  itensPedido: document.getElementById('itens-pedido'),
  rodapeSacola: document.getElementById('rodape-sacola'),
  frete: document.getElementById('frete'),
  avisoEntrega: document.getElementById('aviso-entrega'),
  freteBarra: document.getElementById('frete-barra'),
  subtotal: document.getElementById('subtotal'),
  taxa: document.getElementById('taxa'),
  total: document.getElementById('total'),
  continuar: document.getElementById('continuar'),
  form: document.getElementById('form-pedido'),
  erro: document.getElementById('erro'),
  campoEndereco: document.getElementById('campo-endereco'),
  campoTroco: document.getElementById('campo-troco'),
  telefone: document.getElementById('telefone'),
  totalForm: document.getElementById('total-form'),
  totalDetalhe: document.getElementById('total-detalhe'),
  confirmacao: document.getElementById('confirmacao'),
  confirmacaoTitulo: document.getElementById('confirmacao-titulo'),
  confirmacaoTexto: document.getElementById('confirmacao-texto'),
  confirmacaoItens: document.getElementById('confirmacao-itens'),
  confirmacaoDetalhes: document.getElementById('confirmacao-detalhes'),
  confirmacaoTotal: document.getElementById('confirmacao-total'),
  novoPedido: document.getElementById('novo-pedido'),
  barraSacola: document.getElementById('barra-sacola'),
  barraQtd: document.getElementById('barra-qtd'),
  barraTotal: document.getElementById('barra-total'),
  toast: document.getElementById('toast'),
  toastTexto: document.getElementById('toast-texto'),
  toastVer: document.getElementById('toast-ver'),
};

// Ícones usados dentro do HTML gerado pelo JavaScript
const ICONES = {
  mais: '<svg class="icone" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
  menos: '<svg class="icone" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>',
  lixeira: '<svg class="icone" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
  chama: '<svg class="icone" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
};

function renderizarFiltros() {
  el.filtros.querySelectorAll('[data-filtro]').forEach((botao) => {
    botao.setAttribute('aria-pressed', String(botao.dataset.filtro === estado.filtro));
  });
}

function renderizarCardapio() {
  const categorias = estado.filtro === 'todas' ? Object.keys(CATEGORIAS) : [estado.filtro];

  el.listaCardapio.innerHTML = categorias
    .map((categoria) => {
      const itens = cardapio.filter((item) => item.categoria === categoria);
      const contagem = `${itens.length} ${categoria === 'bebida' ? 'opções' : 'sabores'}`;
      return `
        <section class="grupo">
          <h3 class="grupo__titulo">${CATEGORIAS[categoria]} <small>${contagem}</small></h3>
          <ul class="grade">${itens.map(htmlDoCard).join('')}</ul>
        </section>`;
    })
    .join('');
}

function htmlDoCard(item) {
  const tamanho = tamanhoEscolhido(item);

  const etiqueta = item.etiqueta
    ? `<span class="etiqueta">${ICONES.chama}${item.etiqueta}</span>`
    : '';

  const seletorDeTamanho = item.precos
    ? `
      <div class="tamanhos" role="group" aria-label="Tamanho da ${item.nome}">
        ${Object.entries(TAMANHOS)
          .map(
            ([t, info]) => `
          <button type="button" class="tamanho" data-acao="tamanho" data-id="${item.id}"
            data-tamanho="${t}" aria-pressed="${t === tamanho}">
            <strong>${info.nome}</strong><span>${info.fatias} fatias</span>
          </button>`
          )
          .join('')}
      </div>`
    : '';

  return `
    <li class="card" data-id="${item.id}" data-categoria="${item.categoria}" ${tamanho ? `data-tamanho="${tamanho}"` : ''}>
      <div class="card__imagem">${etiqueta}${ilustracao(item)}</div>
      <div class="card__corpo">
        <div>
          <h4 class="card__nome">${item.nome}</h4>
          <p class="card__descricao">${item.descricao}</p>
        </div>
        ${seletorDeTamanho}
        <div class="card__rodape">
          <span class="card__preco">${formatarPreco(precoDe(item, tamanho))}</span>
          <button type="button" class="botao-adicionar" data-acao="adicionar" data-id="${item.id}"
            aria-label="Adicionar ${item.nome} à sacola">${ICONES.mais}Adicionar</button>
        </div>
      </div>
    </li>`;
}

// Atualiza só o card que mudou de tamanho (sem redesenhar o cardápio todo).
function atualizarCard(id) {
  const item = buscarItem(id);
  const card = el.listaCardapio.querySelector(`.card[data-id="${id}"]`);
  if (!card) return;

  const tamanho = tamanhoEscolhido(item);
  card.dataset.tamanho = tamanho;
  card.querySelectorAll('[data-acao="tamanho"]').forEach((botao) => {
    botao.setAttribute('aria-pressed', String(botao.dataset.tamanho === tamanho));
  });
  card.querySelector('.card__preco').textContent = formatarPreco(precoDe(item, tamanho));
}

function renderizarSacola() {
  // Itens da sacola
  el.itensPedido.innerHTML = estado.sacola
    .map((i) => {
      const item = buscarItem(i.id);
      const ultimo = i.quantidade === 1;
      return `
        <li class="linha-pedido" data-categoria="${item.categoria}">
          <div class="linha-pedido__img">${ilustracao(item)}</div>
          <div>
            <p class="linha-pedido__nome">${i.nome}</p>
            <p class="linha-pedido__detalhe">${i.tamanho ? `${TAMANHOS[i.tamanho].nome}, ` : ''}${formatarPreco(i.preco)} cada</p>
          </div>
          <div class="linha-pedido__lado">
            <span class="linha-pedido__preco">${formatarPreco(i.preco * i.quantidade)}</span>
            <div class="quantidade">
              <button type="button" data-acao="menos" data-chave="${i.chave}"
                aria-label="${ultimo ? 'Remover' : 'Tirar uma unidade de'} ${descreverItem(i)}">${ultimo ? ICONES.lixeira : ICONES.menos}</button>
              <span>${i.quantidade}</span>
              <button type="button" data-acao="mais" data-chave="${i.chave}"
                aria-label="Adicionar mais uma unidade de ${descreverItem(i)}">${ICONES.mais}</button>
            </div>
          </div>
        </li>`;
    })
    .join('');

  const vazia = estado.sacola.length === 0;
  el.sacolaVazia.hidden = !vazia;
  el.rodapeSacola.hidden = vazia;

  // Valores
  const { subtotal, quantidade, taxa, total } = calcularTotais();
  const ehEntrega = estado.tipoRecebimento === 'entrega';

  el.subtotal.textContent = formatarPreco(subtotal);
  el.total.textContent = formatarPreco(total);

  if (!ehEntrega) el.taxa.textContent = 'Sem taxa';
  else if (subtotal >= ENTREGA_GRATIS_A_PARTIR_DE) el.taxa.textContent = 'Grátis';
  else el.taxa.textContent = formatarPreco(taxa);

  // Barra de progresso da entrega grátis
  const falta = ENTREGA_GRATIS_A_PARTIR_DE - subtotal;
  el.frete.hidden = !ehEntrega;
  el.avisoEntrega.textContent =
    falta > 0 ? `Faltam ${formatarPreco(falta)} para ganhar entrega grátis` : 'Você ganhou entrega grátis!';
  el.freteBarra.style.width = `${Math.min(100, (subtotal / ENTREGA_GRATIS_A_PARTIR_DE) * 100)}%`;

  // Resumo na etapa de dados
  el.totalForm.textContent = formatarPreco(total);
  if (!ehEntrega) el.totalDetalhe.textContent = 'Retirada no balcão';
  else if (taxa > 0) el.totalDetalhe.textContent = `Inclui entrega de ${formatarPreco(taxa)}`;
  else el.totalDetalhe.textContent = 'Entrega grátis';

  // Contador do topo e barra do celular
  el.contador.textContent = quantidade;
  el.barraSacola.hidden = quantidade === 0;
  el.barraQtd.textContent = quantidade;
  el.barraTotal.textContent = formatarPreco(total);
}

function renderizarFuncionamento() {
  const status = statusFuncionamento();
  el.seloTexto.textContent = status.texto;
  el.selo.classList.toggle('selo--fechado', !status.aberto);
}

function atualizarCamposDoFormulario() {
  const dados = lerFormulario();
  el.campoEndereco.hidden = dados.tipo !== 'entrega';
  el.campoTroco.hidden = dados.pagamento !== 'dinheiro';
}

function pulsarContador() {
  el.contador.classList.remove('pulsar');
  void el.contador.offsetWidth; // força o navegador a reiniciar a animação
  el.contador.classList.add('pulsar');
}

let temporizadorToast;

function mostrarToast(texto) {
  el.toastTexto.textContent = texto;
  el.toast.classList.add('visivel');
  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(esconderToast, 3000);
}

function esconderToast() {
  el.toast.classList.remove('visivel');
}

/* ---------- Formulário: leitura e validação ---------- */

function lerFormulario() {
  const f = new FormData(el.form);
  return {
    tipo: f.get('tipo'),
    nome: (f.get('nome') || '').trim(),
    telefone: (f.get('telefone') || '').trim(),
    endereco: (f.get('endereco') || '').trim(),
    pagamento: f.get('pagamento'),
    troco: f.get('troco'),
    observacao: (f.get('observacao') || '').trim(),
  };
}

// Devolve null se estiver tudo certo, ou o primeiro problema encontrado.
function validarFormulario(dados, total) {
  if (estado.sacola.length === 0) {
    return { mensagem: 'Adicione pelo menos um item do cardápio antes de confirmar.' };
  }
  if (dados.nome.length < 2) {
    return { mensagem: 'Informe seu nome.', campo: 'nome' };
  }
  if (dados.telefone.replace(/\D/g, '').length < 10) {
    return { mensagem: 'Informe um telefone com DDD.', campo: 'telefone' };
  }
  if (dados.tipo === 'entrega' && dados.endereco.length < 5) {
    return { mensagem: 'Informe o endereço de entrega.', campo: 'endereco' };
  }
  if (dados.pagamento === 'dinheiro' && dados.troco && Number(dados.troco) < total) {
    return { mensagem: `O troco precisa ser para ${formatarPreco(total)} ou mais.`, campo: 'troco' };
  }
  return null;
}

function limparErros() {
  el.erro.textContent = '';
  el.form.querySelectorAll('[aria-invalid]').forEach((campo) => campo.removeAttribute('aria-invalid'));
}

function mascararTelefone(valor) {
  const d = valor.replace(/\D/g, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/* ---------- Confirmação ---------- */

function mostrarConfirmacao(dados, totais) {
  const numero = Math.floor(1000 + Math.random() * 9000);
  const primeiroNome = dados.nome.split(' ')[0];
  const prazo =
    dados.tipo === 'entrega'
      ? `chega em até 45 minutos em ${dados.endereco}`
      : 'fica pronto para retirada em cerca de 25 minutos';

  // textContent (e não innerHTML) para o que o usuário digitou:
  // assim ninguém consegue injetar HTML na página.
  el.confirmacaoTitulo.textContent = `Pedido nº ${numero} confirmado`;
  el.confirmacaoTexto.textContent = `Obrigado, ${primeiroNome}! Seu pedido ${prazo}.`;

  el.confirmacaoItens.innerHTML = '';
  estado.sacola.forEach((i) => {
    const li = document.createElement('li');
    const nome = document.createElement('span');
    const valor = document.createElement('span');
    nome.textContent = `${i.quantidade}× ${descreverItem(i)}`;
    valor.textContent = formatarPreco(i.preco * i.quantidade);
    li.append(nome, valor);
    el.confirmacaoItens.append(li);
  });

  const detalhes = [];
  if (totais.taxa > 0) detalhes.push(`Taxa de entrega: ${formatarPreco(totais.taxa)}`);

  let pagamento = `Pagamento: ${PAGAMENTOS[dados.pagamento]}`;
  if (dados.pagamento === 'dinheiro' && dados.troco) {
    pagamento += `, troco para ${formatarPreco(Number(dados.troco))}`;
  }
  detalhes.push(pagamento);
  if (dados.observacao) detalhes.push(`Observação: ${dados.observacao}`);

  el.confirmacaoDetalhes.innerHTML = '';
  detalhes.forEach((texto) => {
    const p = document.createElement('p');
    p.textContent = texto;
    el.confirmacaoDetalhes.append(p);
  });

  el.confirmacaoTotal.textContent = formatarPreco(totais.total);
  el.confirmacao.showModal();
}

/* ---------- ILUSTRAÇÕES (SVG) ----------
   As pizzas são desenhadas por código: borda, molho, queijo e os
   ingredientes espalhados. Um gerador "aleatório" com semente faz
   cada sabor sair sempre igual, com os ingredientes no mesmo lugar. */

function criarAleatorio(semente) {
  return function () {
    semente = (semente + 0x6d2b79f5) | 0;
    let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const arredondar = (n) => Math.round(n * 10) / 10;

const BASES = {
  tomate: { molho: '#C8321F', queijo: '#F6D46C', manchas: '#E9B64A' },
  branca: { molho: '#E9BE64', queijo: '#F8E3A2', manchas: '#EFC872' },
  chocolate: { molho: '#3B1C10', queijo: '#5E2F1A', manchas: '#7A4127' },
};

// Cada ingrediente: "raio" usado para não sobrepor (0 = pode sobrepor)
// e uma função que devolve o SVG na posição (x, y) com giro "a".
const INGREDIENTES = {
  tomate: {
    raio: 6,
    desenhar: (x, y) =>
      `<circle cx="${x}" cy="${y}" r="5.6" fill="#D63A26"/><circle cx="${x}" cy="${y}" r="4.3" fill="#EF6149"/>` +
      `<circle cx="${x - 1.5}" cy="${y - 1}" r=".8" fill="#FFD9A8"/><circle cx="${x + 1.5}" cy="${y + 0.6}" r=".8" fill="#FFD9A8"/><circle cx="${x}" cy="${y + 2}" r=".8" fill="#FFD9A8"/>`,
  },
  manjericao: {
    raio: 4.5,
    desenhar: (x, y, a) =>
      `<g transform="rotate(${a} ${x} ${y})"><path d="M${x - 5} ${y}Q${x} ${y - 4.2} ${x + 5} ${y}Q${x} ${y + 4.2} ${x - 5} ${y}Z" fill="#2F8A45"/>` +
      `<path d="M${x - 4} ${y}H${x + 4}" stroke="#1F6B33" stroke-width=".5"/></g>`,
  },
  calabresa: {
    raio: 5,
    desenhar: (x, y) =>
      `<circle cx="${x}" cy="${y}" r="4.8" fill="#9E2B22"/><circle cx="${x}" cy="${y}" r="4" fill="#C0402F"/>` +
      `<circle cx="${x - 1.5}" cy="${y - 0.8}" r=".7" fill="#F4B9A3"/><circle cx="${x + 1.3}" cy="${y + 1.3}" r=".7" fill="#F4B9A3"/><circle cx="${x + 0.8}" cy="${y - 1.9}" r=".5" fill="#F4B9A3"/>`,
  },
  azeitona: {
    raio: 2.8,
    desenhar: (x, y) => `<circle cx="${x}" cy="${y}" r="2.3" fill="#2B2320"/><circle cx="${x}" cy="${y}" r=".9" fill="#F6D46C"/>`,
  },
  cebola: {
    raio: 4.5,
    desenhar: (x, y, a) =>
      `<path d="M${x - 4} ${y}A4 4 0 0 1 ${x + 4} ${y}" transform="rotate(${a} ${x} ${y})" fill="none" stroke="#A55AA0" stroke-width="1.3" stroke-linecap="round"/>`,
  },
  frango: {
    raio: 3.5,
    desenhar: (x, y, a) =>
      `<ellipse cx="${x}" cy="${y}" rx="3.2" ry="1.9" transform="rotate(${a} ${x} ${y})" fill="#E8C49A" stroke="#C99A66" stroke-width=".5"/>`,
  },
  catupiry: {
    raio: 5.5,
    desenhar: (x, y, a) =>
      `<ellipse cx="${x}" cy="${y}" rx="5.2" ry="4.3" transform="rotate(${a} ${x} ${y})" fill="#FFF7E6"/><ellipse cx="${x - 1.2}" cy="${y - 1}" rx="2" ry="1.2" fill="#FFFFFF"/>`,
  },
  milho: {
    raio: 0,
    desenhar: (x, y) => `<circle cx="${x}" cy="${y}" r="1.2" fill="#F7C531" stroke="#DCA51A" stroke-width=".3"/>`,
  },
  presunto: {
    raio: 5,
    desenhar: (x, y, a) =>
      `<rect x="${x - 4}" y="${y - 3}" width="8" height="6" rx="1.4" transform="rotate(${a} ${x} ${y})" fill="#F0A0A0" stroke="#DE8585" stroke-width=".5"/>`,
  },
  ovo: {
    raio: 5.5,
    desenhar: (x, y) => `<circle cx="${x}" cy="${y}" r="5" fill="#FFFDF4"/><circle cx="${x + 0.4}" cy="${y + 0.3}" r="2.2" fill="#F7B21E"/>`,
  },
  ervilha: {
    raio: 0,
    desenhar: (x, y) => `<circle cx="${x}" cy="${y}" r="1.3" fill="#72B043" stroke="#4F8A2A" stroke-width=".3"/>`,
  },
  gorgonzola: {
    raio: 4.5,
    desenhar: (x, y, a) =>
      `<ellipse cx="${x}" cy="${y}" rx="4.3" ry="3.6" transform="rotate(${a} ${x} ${y})" fill="#F4F1E4"/>` +
      `<circle cx="${x - 1.4}" cy="${y - 0.6}" r=".7" fill="#5F8676"/><circle cx="${x + 1.2}" cy="${y + 0.8}" r=".6" fill="#5F8676"/><circle cx="${x + 0.6}" cy="${y - 1.5}" r=".5" fill="#5F8676"/>`,
  },
  provolone: {
    raio: 4.5,
    desenhar: (x, y, a) =>
      `<ellipse cx="${x}" cy="${y}" rx="4.4" ry="3.7" transform="rotate(${a} ${x} ${y})" fill="#E9B94E"/><ellipse cx="${x - 0.8}" cy="${y - 0.6}" rx="2.4" ry="1.6" fill="#F3D27E"/>`,
  },
  parmesao: {
    raio: 0,
    desenhar: (x, y, a) =>
      `<rect x="${x - 1.3}" y="${y - 0.45}" width="2.6" height=".9" rx=".4" transform="rotate(${a} ${x} ${y})" fill="#FFF3CF"/>`,
  },
  carne: {
    raio: 3.8,
    desenhar: (x, y, a) =>
      `<rect x="${x - 3.4}" y="${y - 1.6}" width="6.8" height="3.2" rx="1.2" transform="rotate(${a} ${x} ${y})" fill="#7E3A20"/>` +
      `<rect x="${x - 2}" y="${y - 0.9}" width="4" height=".8" rx=".4" transform="rotate(${a} ${x} ${y})" fill="#A0552F"/>`,
  },
  coalho: {
    raio: 5,
    desenhar: (x, y, a) =>
      `<g transform="rotate(${a} ${x} ${y})"><rect x="${x - 3.6}" y="${y - 3.6}" width="7.2" height="7.2" rx="1.2" fill="#FBEAC0" stroke="#E0B45A" stroke-width=".6"/>` +
      `<path d="M${x - 2.4} ${y - 1}h4.8M${x - 2.4} ${y + 1.4}h4.8" stroke="#C98F3A" stroke-width=".8" stroke-linecap="round"/></g>`,
  },
  cheiroVerde: {
    raio: 0,
    desenhar: (x, y, a) =>
      `<rect x="${x - 0.45}" y="${y - 1.2}" width=".9" height="2.4" rx=".4" transform="rotate(${a} ${x} ${y})" fill="#3E9E4E"/>`,
  },
  morango: {
    raio: 5.5,
    desenhar: (x, y, a) =>
      `<g transform="rotate(${a} ${x} ${y})"><path d="M${x} ${y + 5}C${x - 5} ${y + 1} ${x - 4.5} ${y - 4} ${x} ${y - 3.5}C${x + 4.5} ${y - 4} ${x + 5} ${y + 1} ${x} ${y + 5}Z" fill="#E02B3C"/>` +
      `<path d="M${x - 2.6} ${y - 3.6}L${x} ${y - 2.2}L${x + 2.6} ${y - 3.6}L${x} ${y - 5.2}Z" fill="#3C9A4A"/>` +
      `<circle cx="${x - 1.5}" cy="${y}" r=".4" fill="#FFE08A"/><circle cx="${x + 1.4}" cy="${y + 0.4}" r=".4" fill="#FFE08A"/><circle cx="${x}" cy="${y + 2.2}" r=".4" fill="#FFE08A"/><circle cx="${x}" cy="${y - 1.3}" r=".4" fill="#FFE08A"/></g>`,
  },
  goiabada: {
    raio: 5,
    desenhar: (x, y, a) =>
      `<g transform="rotate(${a} ${x} ${y})"><rect x="${x - 3.6}" y="${y - 3.6}" width="7.2" height="7.2" rx="1.6" fill="#A61E35"/>` +
      `<rect x="${x - 2.4}" y="${y - 2.4}" width="3" height="1.2" rx=".6" fill="#D0445A"/></g>`,
  },
  banana: {
    raio: 4.8,
    desenhar: (x, y) =>
      `<circle cx="${x}" cy="${y}" r="4.3" fill="#F8E6A6" stroke="#E3C35E" stroke-width=".7"/><circle cx="${x}" cy="${y}" r="1.1" fill="#E6CB82"/>`,
  },
  canela: {
    raio: 0,
    desenhar: (x, y) => `<circle cx="${x}" cy="${y}" r=".55" fill="#7A3F17" opacity=".75"/>`,
  },
};

// Sorteia um ponto dentro da pizza que não encoste nos ingredientes já colocados.
function posicaoLivre(aleatorio, raio, ocupados) {
  let x = 50;
  let y = 50;
  for (let tentativa = 0; tentativa < 40; tentativa++) {
    const angulo = aleatorio() * Math.PI * 2;
    const distancia = Math.sqrt(aleatorio()) * (34 - raio * 0.5);
    x = 50 + Math.cos(angulo) * distancia;
    y = 50 + Math.sin(angulo) * distancia;
    if (raio === 0) break;
    const livre = ocupados.every((o) => Math.hypot(o.x - x, o.y - y) > o.raio + raio);
    if (livre) break;
  }
  if (raio > 0) ocupados.push({ x, y, raio });
  return [arredondar(x), arredondar(y)];
}

// Contorno levemente irregular do queijo derretido.
function contornoDoQueijo(aleatorio) {
  const pontos = [];
  const fase = aleatorio() * 10;
  for (let i = 0; i < 48; i++) {
    const angulo = (i / 48) * Math.PI * 2;
    const raio = 38.6 + Math.sin(angulo * 6 + fase) * 1.1 + aleatorio() * 0.8;
    pontos.push(`${arredondar(50 + Math.cos(angulo) * raio)},${arredondar(50 + Math.sin(angulo) * raio)}`);
  }
  return `M${pontos.join('L')}Z`;
}

function desenharPizza(item) {
  const aleatorio = criarAleatorio(item.id * 7919);
  const base = BASES[item.base || 'tomate'];
  let svg = '<circle cx="50" cy="50" r="48" fill="url(#grad-borda)"/>';

  // Marquinhas de forno a lenha na borda
  for (let i = 0; i < 16; i++) {
    const angulo = aleatorio() * Math.PI * 2;
    const distancia = 43.5 + aleatorio() * 3;
    svg += `<circle cx="${arredondar(50 + Math.cos(angulo) * distancia)}" cy="${arredondar(50 + Math.sin(angulo) * distancia)}" r="${arredondar(0.7 + aleatorio() * 1.3)}" fill="#6B3A1C" opacity=".35"/>`;
  }

  svg += `<circle cx="50" cy="50" r="41.5" fill="${base.molho}"/>`;
  svg += `<path d="${contornoDoQueijo(aleatorio)}" fill="${base.queijo}"/>`;

  // Manchinhas do queijo gratinado
  for (let i = 0; i < 9; i++) {
    const [x, y] = posicaoLivre(aleatorio, 0, []);
    svg += `<circle cx="${x}" cy="${y}" r="${arredondar(1.5 + aleatorio() * 3)}" fill="${base.manchas}" opacity=".45"/>`;
  }

  // Ingredientes
  const ocupados = [];
  (item.cobertura || []).forEach(({ tipo, qtd }) => {
    const ingrediente = INGREDIENTES[tipo];
    for (let i = 0; i < qtd; i++) {
      const [x, y] = posicaoLivre(aleatorio, ingrediente.raio, ocupados);
      svg += ingrediente.desenhar(x, y, Math.round(aleatorio() * 360));
    }
  });

  // Cortes das fatias
  const cortes = [0, 45, 90, 135]
    .map((graus) => {
      const r = (graus * Math.PI) / 180;
      const dx = arredondar(Math.cos(r) * 40);
      const dy = arredondar(Math.sin(r) * 40);
      return `<path d="M${50 - dx} ${50 - dy}L${50 + dx} ${50 + dy}"/>`;
    })
    .join('');
  svg += `<g stroke="#5A2A10" stroke-opacity=".16" stroke-width=".7">${cortes}</g>`;

  return `<svg class="pizza" viewBox="0 0 100 100" aria-hidden="true">${svg}</svg>`;
}

const DESENHOS_BEBIDAS = {
  refrigerante:
    '<rect x="43" y="6" width="14" height="8" rx="2" fill="#E0402A"/>' +
    '<path d="M44 14h12v6c0 3 9 6 9 14v52a6 6 0 0 1-6 6H41a6 6 0 0 1-6-6V34c0-8 9-11 9-14z" fill="#3B1A10"/>' +
    '<rect x="35" y="50" width="30" height="20" fill="#E0402A"/>' +
    '<path d="M35 60c5-4 10 4 15 0s10-4 15 0" stroke="#fff" stroke-width="2.2" fill="none"/>' +
    '<path d="M40 38v42" stroke="#fff" stroke-opacity=".22" stroke-width="3" stroke-linecap="round"/>',
  suco:
    '<path d="M58 8 51 62" stroke="#2E7D4F" stroke-width="3.2" stroke-linecap="round"/>' +
    '<path d="M30 22h40l-5 66a4 4 0 0 1-4 4H39a4 4 0 0 1-4-4z" fill="#fff" fill-opacity=".7" stroke="#E4C7A5" stroke-width="1.5"/>' +
    '<path d="M32.3 36h35.4l-4 51.6a3 3 0 0 1-3 2.8H39.3a3 3 0 0 1-3-2.8z" fill="#F7A21B"/>' +
    '<path d="M32.3 36h35.4l-.3 4.5H32.6z" fill="#FBC45A"/>' +
    '<circle cx="69" cy="24" r="10" fill="#FFB938"/><circle cx="69" cy="24" r="7.8" fill="#FFE08A"/>' +
    '<path d="M69 16.5v15M61.5 24h15M63.7 18.7l10.6 10.6M74.3 18.7 63.7 29.3" stroke="#FFB938" stroke-width="1"/>',
  agua:
    '<rect x="44" y="12" width="12" height="7" rx="1.5" fill="#2F80C1"/>' +
    '<path d="M45 19h10v5c0 2 6 4 6 10v50a6 6 0 0 1-6 6H45a6 6 0 0 1-6-6V34c0-6 6-8 6-10z" fill="#D7ECF8" stroke="#A9D2EC" stroke-width="1.2"/>' +
    '<path d="M40 44h20v40a5 5 0 0 1-5 5H45a5 5 0 0 1-5-5z" fill="#A9D6F2" opacity=".75"/>' +
    '<rect x="39.6" y="52" width="20.8" height="14" fill="#fff"/>' +
    '<path d="M42.5 60c3-3 5 3 7.5 0s5-3 7.5 0" stroke="#2F80C1" stroke-width="1.6" fill="none"/>' +
    '<path d="M43 36v44" stroke="#fff" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/>',
};

function desenharBebida(item) {
  return `<svg class="bebida" viewBox="0 0 100 100" aria-hidden="true">${DESENHOS_BEBIDAS[item.desenho]}</svg>`;
}

// Guarda os desenhos prontos para não recalcular toda hora.
const cacheIlustracoes = {};

function ilustracao(item) {
  if (!cacheIlustracoes[item.id]) {
    cacheIlustracoes[item.id] = item.categoria === 'bebida' ? desenharBebida(item) : desenharPizza(item);
  }
  return cacheIlustracoes[item.id];
}

/* ---------- 6. EVENTOS ---------- */

el.filtros.addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-filtro]');
  if (botao) escolherFiltro(botao.dataset.filtro);
});

// Um único "ouvinte" para todos os botões do cardápio (delegação de eventos).
el.listaCardapio.addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-acao]');
  if (!botao) return;

  const id = Number(botao.dataset.id);
  if (botao.dataset.acao === 'tamanho') escolherTamanho(id, botao.dataset.tamanho);
  if (botao.dataset.acao === 'adicionar') adicionarNaSacola(id);
});

el.itensPedido.addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-acao]');
  if (!botao) return;
  alterarQuantidade(botao.dataset.chave, botao.dataset.acao === 'mais' ? 1 : -1);
});

// Abrir e fechar a sacola
el.abrirSacola.addEventListener('click', abrirSacola);
el.barraSacola.addEventListener('click', abrirSacola);
el.toastVer.addEventListener('click', abrirSacola);
el.fecharGaveta.addEventListener('click', () => el.gaveta.close());
el.gaveta.addEventListener('close', () => {
  irParaEtapa('sacola');
  limparErros();
});

// Clicar no fundo escuro fora do painel também fecha
el.gaveta.addEventListener('click', (evento) => {
  if (evento.target === el.gaveta) el.gaveta.close();
});

el.irCardapio.addEventListener('click', () => {
  el.gaveta.close();
  document.getElementById('cardapio').scrollIntoView();
});

// Navegação entre as etapas
el.continuar.addEventListener('click', () => {
  irParaEtapa('dados');
  el.form.elements.nome.focus();
});

el.voltar.addEventListener('click', () => {
  irParaEtapa('sacola');
  el.continuar.focus();
});

// Formulário
el.form.addEventListener('change', (evento) => {
  if (evento.target.name === 'tipo') mudarTipoRecebimento(evento.target.value);
  if (evento.target.name === 'pagamento') atualizarCamposDoFormulario();
});

// Quando o usuário corrige um campo com erro, a mensagem some.
el.form.addEventListener('input', (evento) => {
  if (evento.target.hasAttribute('aria-invalid')) limparErros();
});

el.telefone.addEventListener('input', () => {
  el.telefone.value = mascararTelefone(el.telefone.value);
});

el.form.addEventListener('submit', (evento) => {
  evento.preventDefault(); // não recarrega a página

  const dados = lerFormulario();
  const totais = calcularTotais();
  const problema = validarFormulario(dados, totais.total);

  limparErros();

  if (problema) {
    el.erro.textContent = problema.mensagem;
    if (problema.campo) {
      const campo = el.form.elements[problema.campo];
      campo.setAttribute('aria-invalid', 'true');
      campo.focus();
    }
    return;
  }

  el.gaveta.close();
  mostrarConfirmacao(dados, totais);
});

// Fechar a confirmação (pelo botão ou pela tecla Esc) começa um pedido novo.
el.novoPedido.addEventListener('click', () => el.confirmacao.close());
el.confirmacao.addEventListener('close', reiniciarPedido);

/* ---------- Início ---------- */
el.heroPizza.innerHTML = ilustracao(buscarItem(1));
el.pizzaVazia.innerHTML = desenharPizza({ id: 99, cobertura: [] });
renderizarFuncionamento();
renderizarFiltros();
renderizarCardapio();
renderizarSacola();
atualizarCamposDoFormulario();