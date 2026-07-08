<div align="center">

<img src="https://raw.githubusercontent.com/gabrielseffrin/front-expedisoft/main/public/logo.png" alt="ExpediSoft Logo" width="180"/>

# ExpediSoft — Plataforma Web

**Interface administrativa para gestão e rastreabilidade de carregamentos**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-000000?style=flat-square)](https://ui.shadcn.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Sobre](#-sobre) · [Telas](#-telas) · [Tecnologias](#-tecnologias) · [Instalação](#-instalação) · [Repositórios](#-repositórios)

</div>

---

## 📦 Sobre

O **front-expedisoft** é a plataforma web do ecossistema ExpediSoft, destinada aos **gestores logísticos**. Permite agendar carregamentos, alocar operadores e docas, acompanhar o andamento das operações em tempo real e auditar todo o histórico de conferências com acesso a fotos e justificativas registradas pelos operadores em campo.

> Desenvolvido como Trabalho de Conclusão de Curso na UTFPR Guarapuava (2026). Consome a [API Laravel](https://github.com/gabrielseffrin/back-expedisoft) e complementa o [aplicativo mobile](https://github.com/gabrielseffrin/app-expedisoft) utilizado pelos operadores.

---

## 🖥 Telas

### Dashboard — Monitoramento em tempo real
Indicadores operacionais, distribuição de ordens por status e gráfico de atividade dos últimos 14 dias.

![Dashboard](https://raw.githubusercontent.com/gabrielseffrin/front-expedisoft/main/public/screenshots/dashboard.png)

### Ordens de Carregamento — Listagem e agendamento
Todas as ordens importadas do ERP, com agendamento de data, hora, operador e doca via modal.

![Ordens](https://raw.githubusercontent.com/gabrielseffrin/front-expedisoft/main/public/screenshots/orders.png)

### Detalhes da Ordem — Auditoria completa
Informações da carga, cronograma de execução, itens conferidos, fotos e justificativas do operador.

![Detalhes](https://raw.githubusercontent.com/gabrielseffrin/front-expedisoft/main/public/screenshots/order-details.png)

### Ordem com Divergência
Exibe a justificativa textual registrada pelo operador quando a carga foi finalizada com inconformidades.

![Divergência](https://raw.githubusercontent.com/gabrielseffrin/front-expedisoft/main/public/screenshots/divergence.png)

---

## ✨ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| **Autenticação** | Login seguro com persistência de sessão via Context API |
| **Dashboard** | Cards de status, gráfico de tendência e tabela de atividade recente |
| **Listagem de Ordens** | Filtro por status, busca e exportação CSV |
| **Agendamento** | Modal com seleção de data, hora, operador responsável e doca |
| **Auditoria** | Visualização completa de cada carregamento: itens, fotos, timeline e justificativas |
| **Monitoramento ao vivo** | Acompanhamento de ordens em andamento com atualização do progresso |
| **Visualizador de Fotos** | Ampliação das evidências fotográficas registradas pelos operadores |

---

## 🛠 Tecnologias

| Tecnologia | Uso |
|---|---|
| **React 18** | Biblioteca principal de UI com componentes funcionais e Hooks |
| **TypeScript** | Tipagem estática para maior segurança e produtividade |
| **Vite** | Build tool com HMR ultrarrápido |
| **Tailwind CSS** | Estilização utilitária |
| **shadcn/ui** | Componentes acessíveis baseados em Radix UI com controle total do código |
| **Context API** | Gerenciamento de estado de autenticação e sessão global |
| **React Router** | Roteamento com proteção de rotas privadas |

---

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+
- [back-expedisoft](https://github.com/gabrielseffrin/back-expedisoft) rodando localmente ou em produção

```bash
# 1. Clone o repositório
git clone https://github.com/gabrielseffrin/front-expedisoft.git
cd front-expedisoft

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com a URL da API
# VITE_API_URL=http://localhost:8000

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

### Build para produção

```bash
npm run build
# Os arquivos estáticos serão gerados em /dist
```

---

## 📁 Estrutura do Projeto

```
front-expedisoft/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes shadcn/ui
│   │   └── shared/          # Componentes reutilizáveis do projeto
│   ├── pages/               # Páginas (Dashboard, Orders, Details...)
│   ├── context/             # AuthContext — sessão global
│   ├── services/            # Chamadas à API REST
│   ├── types/               # Interfaces TypeScript
│   └── lib/                 # Utilitários
├── public/
│   └── screenshots/         # Capturas de tela para documentação
├── vite.config.ts
└── tailwind.config.js
```

---

## 🔗 Repositórios

| Repositório | Descrição |
|---|---|
| **[back-expedisoft](https://github.com/gabrielseffrin/back-expedisoft)** | API Laravel · Backend |
| **[front-expedisoft](https://github.com/gabrielseffrin/front-expedisoft)** | ← você está aqui · Plataforma Web |
| **[app-expedisoft](https://github.com/gabrielseffrin/app-expedisoft)** | App mobile · React Native + Expo |

---

## 👨‍💻 Autor

**Gabriel Fernando Seffrin**
Tecnólogo em Sistemas para Internet — UTFPR Guarapuava (2026)
Orientador: Prof. Dr. Emerson André Fedechen

[![GitHub](https://img.shields.io/badge/GitHub-gabrielseffrin-181717?style=flat-square&logo=github)](https://github.com/gabrielseffrin)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-gabrielseffrin-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/gabriel-seffrin-369952223?utm_source=share_via&utm_content=profile&utm_medium=member_android)