# 🚀 Prompts Virais — Clone Completo & Idêntico

Clone 100% idêntico, autônomo e funcional da landing page e ecossistema **Prompts Virais** ([https://promptsviraisbr.lovable.app/](https://promptsviraisbr.lovable.app/)), extraído com fidelidade absoluta de design, efeitos visuais, interatividade e todas as mídias originais.

---

## 📦 O que foi extraído e clonado

- **Vídeo de VSL Principal** (`prompts-virais-vsl-compatible.mp4`, 28.7 MB) + Poster oficial em alta resolução.
- **53 Vídeos de Vitrine, Carrossel & Depoimentos** em formato otimizado WebM e MP4:
  - Vitrines de demonstração UGC (Unboxing, POV 360°, Try-on, Cabelo, Streetwear, etc.).
  - Vídeos do Carrossel de retenção TikTok Shop.
  - Vídeos de depoimentos de alunos e provas sociais.
- **Acervo Visual Completo (100% dos Assets Locais)**:
  - Logo oficial Prompts Virais 3D (`rv-logo-3d.png`).
  - Logo 3D Glass exclusivo da tela de login (`rv-logo-glass.png`).
  - Capas e banners em alta definição para a Área de Membros:
    - `capa-vip.png` (Prompts Virais FGC).
    - `capa-estilos-prompts.png` (Estilos de Prompts UGC).
    - `capa-prompts-vendem.png` (Prompts que Vendem).
    - `capa-prompts-virais-duo.png` (Prompts Virais Duo).
  - Foto oficial do fundador Kael Santyns (`kael-santyns.jpg`) no termo de proteção autoral.
  - Logo tipográfico Prompts Virais (`prompts-virais-logo.png`).
  - Cards de comparação e prints de faturamento real do TikTok Shop (`IMG_4843` até `IMG_4851`).
  - Todos os posters de transição dos vídeos, favicon e Web App Manifest.
- **Design & Efeitos Visuais**:
  - CSS original (`styles-CMsMeHHC.css`) com animações de brilho dourado (`gold-shine`, `gold-pill-shine`), marquee infinito, orbs de gradiente e tipografia Google Fonts (`Anton`, `Inter Tight`, `Outfit`).
  - Estilos complementares otimizados em `enhancements.css`.
- **Rotas e Páginas Extras 100% Funcionais**:
  - `/` — Landing page principal de alta conversão com VSL, vitrines, tabela de planos e FAQ.
  - `/auth` — Tela de login VIP com validação estrita contra o banco de usuários cadastrados pelo administrador.
  - `/admin` — **Painel Exclusivo do Administrador**: Permite cadastrar alunos, definir e-mails e senhas, bloquear/liberar acessos e copiar mensagem pronta para envio no WhatsApp. Bloqueia qualquer auto-cadastro não autorizado.
  - `/criar-acesso` — Fluxo seguro com verificação de e-mail liberado pelo administrador.
  - `/ativar` — Tela de verificação e ativação com validação de credenciais.
  - `/membros` — Área VIP de Membros com carrossel dinâmico, filtros de categorias (POV, Feminino, Masculino, Unboxing, Carrossel, Favoritos), prévias em vídeo, caixas de prompt visíveis na tela, modal com prompt completo em inglês/português, cópia universal com 1 clique e botão de Como Fazer.
  - `/extrair-prompt` — Ferramenta de inteligência artificial para extração de prompts a partir de vídeos, com divisão em cenas (takes), cópia com 1 clique e histórico de prompts salvos.

---

## ⚡ Interatividade e Recursos do Clone

- **Player de VSL Avançado**:
  - Botão de ativação de áudio flutuante com feedback visual pulsante (*"Sua aula já começou — Clique para ativar o som"*).
  - Barra de progresso interativa sincronizada, play/pause, indicador de tempo em formato `MM:SS`, controle de volume e modo tela cheia.
- **Observador de Vídeos em 60fps**:
  - Reprodução inteligente com `IntersectionObserver` para carrosséis e vitrines (reproduz com fluidez quando visível na tela e pausa fora dela, economizando bateria e memória de GPU).
- **FAQ com Accordion Completo**:
  - Todas as 7 perguntas e respostas oficiais implementadas com expansão suave e rotação de ícones.
- **Timers Regressivos de Escassez**:
  - Timer de 15:00 minutos no banner superior com persistência em sessão.
  - Cronômetro de 24 horas (Horas, Minutos e Segundos) na seção de Planos.
- **Popups de Prova Social em Tempo Real (Toasts)**:
  - Notificações discretas no canto inferior esquerdo mostrando compras recentes verificadas de alunos em diversas capitais do Brasil.
- **Barra de Compra Fixa Mobile**:
  - Ao rolar a página no celular, surge a barra inferior com botão de acesso direto ao checkout.
- **Âncoras de Navegação Fluidas**:
  - Menu superior conectado perfeitamente a `#top`, `#capacidades`, `#demo`, `#planos` e `#faq`.

---

## 🛠️ Como Executar Localmente

### Pré-requisitos
- Node.js instalado (v18 ou superior).

### Inicialização Rápida

1. Abra o terminal na pasta do projeto:
```bash
cd c:\Users\mcass\Downloads\clone
```

2. Inicie o servidor:
```bash
npm start
```
*(ou `node serve.js`)*

3. Acesse no navegador:
👉 **[http://localhost:3030](http://localhost:3030)**

Rotas disponíveis:
- Home: `http://localhost:3030/`
- Entrada VIP: `http://localhost:3030/auth`
- Área de Membros: `http://localhost:3030/membros`
- Extrator de Prompt: `http://localhost:3030/extrair-prompt`
- Criar Acesso: `http://localhost:3030/criar-acesso`
- Ativar Conta: `http://localhost:3030/ativar`

---

## 🧪 Como Rodar os Testes Automatizados

O projeto inclui uma suíte de testes de integridade profunda que valida:
- Status 200 de todas as rotas HTML (`/`, `/auth`, `/membros`, `/ativar`, `/criar-acesso`, `/extrair-prompt`).
- Validação de conteúdo DOM e presença de formulários interativos.
- Presença e integridade das folhas de estilo e bundles JavaScript.
- Streaming com suporte a Range Requests (código 206) do vídeo da VSL.
- Carregamento de imagens, logos 3D e capas da área VIP.
- Verificação de 404 estrito para arquivos inexistentes (evitando falso positivo de SPA).
- Endpoint de checkout mock `/api/create-pix` com cálculo de cupom de desconto.

Para rodar os testes:
```bash
npm test
```

---

## 📁 Estrutura de Arquivos

```
c:\Users\mcass\Downloads\clone\
├── package.json             # Configuração e scripts npm
├── serve.js                 # Servidor HTTP com Range Requests e API mock
├── test_server.js           # Suíte de verificação automatizada completa
├── README.md                # Documentação do projeto
└── site/                    # Diretório estático compilado
    ├── index.html           # Landing page principal
    ├── auth/                # Página de login VIP
    ├── criar-acesso/        # Criação de acesso pós-Pix
    ├── ativar/              # Ativação de conta
    ├── membros/             # Área VIP de membros com catálogo de prompts
    ├── extrair-prompt/      # Ferramenta de extração de prompts por vídeo
    ├── enhancements.js      # Motor de interatividade, VSL, FAQ e timers
    ├── enhancements.css     # Estilos complementares
    ├── assets/              # Scripts e CSS minificados
    └── __l5e/assets-v1/     # Todos os 53+ vídeos MP4/WebM, capas e imagens
```

---

## 🚀 Como Publicar em Produção

O diretório `site/` é 100% estático e pronto para ser publicado em qualquer provedor:

- **Vercel / Netlify / Cloudflare Pages**: Aponte o diretório raiz de publicação para `site`.
- **Hospedagem cPanel / Apache / Nginx**: Basta fazer o upload de todo o conteúdo da pasta `site/` para `public_html/`.
