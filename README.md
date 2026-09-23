# Forno da Vila — Pizzaria

Aplicação web de uma pizzaria fictícia, com cardápio, sacola de compras e
finalização de pedido. Projeto acadêmico desenvolvido para a disciplina de
Desenvolvimento de Software em Nuvem.

## Links

- **Aplicação online:** <!-- cole aqui o link do GitHub Pages -->
- **Editor no StackBlitz:** https://stackblitz.com/github/vscaueh/Des.Nuvem
- **Repositório:** https://github.com/vscaueh/Des.Nuvem

## Funcionalidades

- Cardápio montado dinamicamente a partir de uma lista de dados em JavaScript
- Filtro por categoria: pizzas salgadas, pizzas doces e bebidas
- Escolha de tamanho (pequena, média ou grande) com atualização do preço
- Sacola em painel lateral, com alteração de quantidade e remoção de itens
- Cálculo de subtotal, taxa de entrega e total, com entrega grátis acima de R$ 100
- Opção de entrega ou retirada no balcão, com campos que se adaptam à escolha
- Formulário com máscara de telefone, validação e mensagens de erro específicas
- Pagamento por Pix, cartão ou dinheiro, com cálculo de troco
- Confirmação do pedido com número e resumo dos itens
- Indicação de aberto ou fechado calculada pelo horário atual
- Layout responsivo, com barra fixa da sacola no celular
- Ilustrações das pizzas e bebidas desenhadas em SVG por código, sem imagens externas

## Tecnologias

HTML5, CSS3 e JavaScript puro, sem frameworks ou bibliotecas externas.
As fontes vêm do Google Fonts e as ilustrações são SVG gerado em tempo de execução.

## Estrutura

```
index.html    estrutura da página
styles.css    estilos, variáveis de cor e layout responsivo
script.js     dados, estado, cálculos, renderização, eventos e ilustrações
```

O `script.js` segue sempre o mesmo fluxo: uma ação altera o objeto `estado`
e em seguida chama uma função de renderização. A tela é um reflexo do estado.

## Como executar localmente

```bash
git clone https://github.com/vscaueh/Des.Nuvem.git
cd Des.Nuvem
npm install
npm start
```

Também funciona abrindo o `index.html` direto no navegador.

## Prints

<!-- Depois de subir as imagens em docs/prints, descomente as linhas abaixo

![Tela inicial](docs/prints/01-tela-inicial.png)
![Cardápio](docs/prints/02-cardapio.png)
![Sacola](docs/prints/04-sacola.png)
![Pedido confirmado](docs/prints/07-pedido-confirmado.png)

-->