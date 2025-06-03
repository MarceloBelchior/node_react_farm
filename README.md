# Brain Agriculture - Sistema de Gestão de Produtores Rurais

## 📋 Sobre o Projeto

Este é um sistema web para gerenciar o cadastro de produtores rurais, desenvolvido como teste técnico para a Brain Agriculture. O sistema permite cadastrar produtores, suas fazendas e culturas, além de exibir um dashboard com estatísticas e gráficos.

## 🎯 Funcionalidades

### Gestão de Produtores
- ✅ Cadastro, edição e exclusão de produtores rurais
- ✅ Validação de CPF e CNPJ
- ✅ Interface intuitiva e responsiva

### Gestão de Fazendas
- ✅ Associação de múltiplas fazendas por produtor
- ✅ Validação da soma das áreas (agricultável + vegetação ≤ área total)
- ✅ Registro de múltiplas culturas por safra
- ✅ Informações detalhadas: cidade, estado, áreas

### Dashboard
- ✅ Total de fazendas cadastradas
- ✅ Total de hectares
- ✅ Gráfico de pizza por estado
- ✅ Gráfico de culturas plantadas
- ✅ Gráfico de uso do solo (área agricultável vs vegetação)

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Redux Toolkit** - Gerenciamento de estado
- **Styled Components** - CSS-in-JS
- **Recharts** - Gráficos interativos
- **Jest & React Testing Library** - Testes
- **Atomic Design** - Arquitetura de componentes

### Estrutura do Projeto
```
src/
├── components/
│   ├── atoms/          # Componentes básicos (Button, Input, etc.)
│   ├── molecules/      # Componentes compostos (Forms, Charts)
│   ├── organisms/      # Componentes complexos (Navigation, Lists)
│   └── templates/      # Layouts de página
├── pages/              # Páginas da aplicação
├── store/              # Redux store e slices
├── types/              # Definições de tipos TypeScript
├── utils/              # Utilitários e validações
└── __tests__/          # Testes unitários
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 16+
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone <repository-url>
cd agricultura

# Instale as dependências
npm install

# Execute o projeto
npm start
```

A aplicação estará disponível em `http://localhost:3000`

### Scripts Disponíveis
```bash
npm start          # Executa em modo desenvolvimento
npm build          # Build para produção
npm test           # Executa os testes
npm test --coverage # Executa testes com coverage
```

## 🧪 Testes

O projeto inclui testes unitários para:
- Validações de CPF/CNPJ
- Componentes React (Button, Forms, etc.)
- Páginas (Dashboard, Produtores)
- Redux store e actions

```bash
# Executar todos os testes
npm test

# Executar testes com coverage
npm test -- --coverage --watchAll=false
```

## 📱 Responsividade

O sistema é totalmente responsivo, adaptando-se a:
- 📱 Mobile (< 768px)
- 📱 Tablet (768px - 1024px)
- 💻 Desktop (> 1024px)

## ✅ Validações Implementadas

### Produtor
- Nome obrigatório
- CPF/CNPJ obrigatório e válido
- Formatação automática durante digitação

### Fazenda
- Nome, cidade e estado obrigatórios
- Área total deve ser maior que zero
- Soma das áreas agricultável e vegetação não pode exceder área total
- Validação de números positivos

## 🎨 Design System

### Cores
- **Primary**: Verde (#2E7D32) - representa agricultura
- **Secondary**: Laranja (#FF6F00) - destaque
- **Success**: Verde claro (#4CAF50)
- **Warning**: Laranja (#FF9800)
- **Error**: Vermelho (#F44336)

### Componentes
- Seguem padrões de acessibilidade
- Estados visuais claros (hover, focus, disabled)
- Feedback visual consistente

## 📊 Dados Mock

O sistema inclui dados de exemplo para demonstração:
- 2 produtores cadastrados
- Múltiplas fazendas com diferentes culturas
- Dados distribuídos por diferentes estados

## 🔮 Possíveis Melhorias Futuras

- [ ] Persistência em banco de dados
- [ ] Autenticação e autorização
- [ ] Exportação de relatórios (PDF, Excel)
- [ ] Integração com APIs externas (clima, preços)
- [ ] Notificações push
- [ ] Mode escuro
- [ ] Internacionalização (i18n)
- [ ] Progressive Web App (PWA)

## 📄 Licença

Este projeto foi desenvolvido como teste técnico para a Brain Agriculture.

---

**Desenvolvido com ❤️ e ☕ para a Brain Agriculture**
# node_react_farm
# node_react_farm
