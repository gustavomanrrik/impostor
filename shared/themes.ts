export type ThemeGroup = [string, string];

export interface Theme {
  id: string;
  name: string;
  icon: string;
  is18Plus: boolean;
  pairs: {
    easy: ThemeGroup[];
    medium: ThemeGroup[];
    hard: ThemeGroup[];
  };
}

// 1. Comida e Bebida (Muito comum)
const comidaGroups: ThemeGroup[] = [
  ['Maçã', 'Pera'], ['Banana', 'Mamão'], ['Laranja', 'Tangerina'], ['Limão', 'Maracujá'],
  ['Melancia', 'Melão'], ['Uva', 'Morango'], ['Abacaxi', 'Manga'], ['Goiaba', 'Caju'],
  ['Arroz', 'Feijão'], ['Macarrão', 'Lasanha'], ['Pizza', 'Hambúrguer'], ['Cachorro-quente', 'Misto-quente'],
  ['Pão Francês', 'Pão de Forma'], ['Bolo', 'Torta'], ['Pudim', 'Sorvete'], ['Chocolate', 'Bala'],
  ['Pipoca', 'Amendoim'], ['Biscoito', 'Bolacha'], ['Café', 'Leite'], ['Chá', 'Suco'],
  ['Água', 'Refrigerante'], ['Cerveja', 'Vinho'], ['Batata Frita', 'Mandioca Frita'], ['Sopa', 'Caldo'],
  ['Alface', 'Couve'], ['Tomate', 'Cebola'], ['Alho', 'Pimenta'], ['Cenoura', 'Batata'],
  ['Carne Assada', 'Frango Assado'], ['Linguiça', 'Salsicha'], ['Queijo', 'Presunto'], ['Manteiga', 'Margarina']
];

// 2. Lugares (Locais conhecidos por todos)
const lugaresGroups: ThemeGroup[] = [
  ['Praia', 'Piscina'], ['Escola', 'Faculdade'], ['Hospital', 'Posto de Saúde'], ['Farmácia', 'Supermercado'],
  ['Padaria', 'Açougue'], ['Cinema', 'Teatro'], ['Shopping', 'Loja'], ['Parque', 'Praça'],
  ['Igreja', 'Templo'], ['Cemitério', 'Funerária'], ['Aeroporto', 'Rodoviária'], ['Ponto de Ônibus', 'Estação de Trem'],
  ['Restaurante', 'Lanchonete'], ['Pizzaria', 'Sorveteria'], ['Bar', 'Boteco'], ['Delegacia', 'Corpo de Bombeiros'],
  ['Banco', 'Lotérica'], ['Hotel', 'Motel'], ['Academia', 'Clube'], ['Biblioteca', 'Livraria'],
  ['Museu', 'Zoológico'], ['Circo', 'Parque de Diversões'], ['Rua', 'Avenida'], ['Estrada', 'Rodovia'],
  ['Casa', 'Apartamento'], ['Prédio', 'Condomínio'], ['Rio', 'Mar'], ['Floresta', 'Montanha'],
  ['Fazenda', 'Sítio'], ['Estacionamento', 'Garagem'], ['Mecânica', 'Posto de Gasolina'], ['Salão de Beleza', 'Barbearia']
];

// 3. Entretenimento (Clássicos absolutos)
const entretenimentoGroups: ThemeGroup[] = [
  ['Homem-Aranha', 'Batman'], ['Superman', 'Coringa'], ['Vingadores', 'Liga da Justiça'], ['Harry Potter', 'Senhor dos Anéis'],
  ['Star Wars', 'Jornada nas Estrelas'], ['A Bela e a Fera', 'Cinderela'], ['Rei Leão', 'Toy Story'], ['Shrek', 'A Era do Gelo'], 
  ['Jurassic Park', 'Tubarão'], ['Titanic', 'Avatar'], ['Matrix', 'O Exterminador do Futuro'], ['De Volta Para o Futuro', 'Caça-Fantasmas'], 
  ['Chaves', 'Chapolin'], ['Silvio Santos', 'Faustão'], ['Gugu', 'Celso Portiolli'], ['Xuxa', 'Angélica'], 
  ['Rodrigo Faro', 'Luciano Huck'], ['Big Brother Brasil', 'A Fazenda'], ['MasterChef', 'Bake Off Brasil'], ['Jornal Nacional', 'Fantástico'], 
  ['Turma da Mônica', 'Menino Maluquinho'], ['Sítio do Picapau Amarelo', 'Castelo Rá-Tim-Bum'], ['RBD', 'High School Musical'], 
  ['Stranger Things', 'Round 6'], ['La Casa de Papel', 'Peaky Blinders']
];

// 4. Personagens de Jogos
const jogosGroups: ThemeGroup[] = [
  ['Mario', 'Luigi'], ['Sonic', 'Tails'], ['Kratos', 'Master Chief'], ['Sub-Zero', 'Scorpion'],
  ['Ryu', 'Ken'], ['Pac-Man', 'Bomberman'], ['Crash Bandicoot', 'Donkey Kong'], ['Zelda', 'Link'], 
  ['Lara Croft', 'Chun-Li'], ['Steve (Minecraft)', 'Roblox'], ['Free Fire', 'Fortnite'], ['GTA', 'Call of Duty'], 
  ['Fifa', 'Bomba Patch'], ['Mortal Kombat', 'Street Fighter'], ['Resident Evil', 'Silent Hill'], ['The Sims', 'SimCity'],
  ['Counter Strike', 'Valorant'], ['League of Legends', 'Dota'], ['Tetris', 'Campo Minado'], ['Super Nintendo', 'PlayStation']
];

// 5. Cantores e Bandas (Música popular)
const cantoresGroups: ThemeGroup[] = [
  ['Roberto Carlos', 'Amado Batista'], ['Raça Negra', 'Só Pra Contrariar'], ['Zeca Pagodinho', 'Arlindo Cruz'], ['Thiaguinho', 'Dilsinho'],
  ['Anitta', 'Ludmilla'], ['Ivete Sangalo', 'Claudia Leitte'], ['Marília Mendonça', 'Maiara e Maraisa'], ['Gusttavo Lima', 'Luan Santana'],
  ['Jorge e Mateus', 'Henrique e Juliano'], ['Zezé Di Camargo', 'Luciano'], ['Chitãozinho', 'Xororó'], ['Leonardo', 'Eduardo Costa'],
  ['Wesley Safadão', 'Xand Avião'], ['João Gomes', 'Zé Vaqueiro'], ['Calypso', 'Banda Eva'], ['Legião Urbana', 'Capital Inicial'],
  ['Charlie Brown Jr', 'Skank'], ['O Rappa', 'Natiruts'], ['Racionais MCs', 'Marcelo D2'], ['Matuê', 'Filipe Ret'],
  ['Michael Jackson', 'Madonna'], ['Elvis Presley', 'Beatles'], ['Queen', 'Guns N Roses'], ['Beyoncé', 'Rihanna'],
  ['Justin Bieber', 'Bruno Mars'], ['Adele', 'Katy Perry'], ['Shakira', 'Jennifer Lopez'], ['Taylor Swift', 'Ariana Grande']
];

// 6. Personagens de Animes e Desenhos
const animesGroups: ThemeGroup[] = [
  ['Goku', 'Naruto'], ['Vegeta', 'Sasuke'], ['Pikachu', 'Ash'], ['Seiya', 'Shiryu'], 
  ['Luffy', 'Zoro'], ['Mestre Kame', 'Jiraiya'], ['Bob Esponja', 'Patrick'], ['Mickey Mouse', 'Pato Donald'],
  ['Pica-Pau', 'Tom e Jerry'], ['Pernalonga', 'Patolino'], ['Gohan', 'Piccolo'], ['Freeza', 'Cell'],
  ['Kuririn', 'Yamcha'], ['Sakura', 'Hinata'], ['Kakashi', 'Maito Gai'], ['Bulma', 'Chichi'],
  ['Homer Simpson', 'Peter Griffin'], ['Scooby-Doo', 'Salsicha'], ['Batman', 'Superman'], ['Meninas Superpoderosas', 'Três Espiãs Demais']
];

// 7. Relacionamentos (Conceitos universais)
const relacionamentosGroups: ThemeGroup[] = [
  ['Casamento', 'Noivado'], ['Namoro', 'Ficada'], ['Amor', 'Paixão'], ['Amigo', 'Colega'],
  ['Irmão', 'Primo'], ['Pai', 'Avô'], ['Mãe', 'Avó'], ['Tio', 'Sobrinho'],
  ['Sogra', 'Cunhada'], ['Genro', 'Nora'], ['Padrinho', 'Afilhado'], ['Gêmeos', 'Filho Único'],
  ['Beijo', 'Abraço'], ['Carinho', 'Cafuné'], ['Briga', 'Discussão'], ['Traição', 'Fidelidade'],
  ['Ciúmes', 'Inveja'], ['Saudade', 'Lembrança'], ['Encontro', 'Despedida'], ['Término', 'Divórcio'],
  ['Solteiro', 'Casado'], ['Viúvo', 'Separado'], ['Sócio', 'Parceiro'], ['Chefe', 'Empregado'],
  ['Médico', 'Paciente'], ['Professor', 'Aluno'], ['Vizinho', 'Síndico'], ['Fã', 'Ídolo']
];

// 8. Proibidão (+18) (Apenas palavras muito comuns)
const adultoGroups: ThemeGroup[] = [
  ['Camisinha', 'Pílula'], ['Sex Shop', 'Motel'], ['Lingerie', 'Fantasia'], ['Algemas', 'Chicote'],
  ['Vibrador', 'Lubrificante'], ['Nudes', 'Vídeo Íntimo'], ['Tinder', 'Badoo'], ['Fetiche', 'Tarado'],
  ['Striptease', 'Pole Dance'], ['Cabaré', 'Zona'], ['Orgia', 'Suruba'], ['Beijo de Língua', 'Chupão'],
  ['Amizade Colorida', 'Peguete'], ['Amante', 'Rapariga'], ['Corno', 'Ricardão'], ['Puteiro', 'Muralha']
];

export const themes: Theme[] = [
  {
    id: 'comida',
    name: 'Comida e Bebida',
    icon: '🍔',
    is18Plus: false,
    pairs: {
      easy: comidaGroups,
      medium: comidaGroups,
      hard: comidaGroups
    }
  },
  {
    id: 'lugares',
    name: 'Lugares',
    icon: '🏫',
    is18Plus: false,
    pairs: {
      easy: lugaresGroups,
      medium: lugaresGroups,
      hard: lugaresGroups
    }
  },
  {
    id: 'entretenimento',
    name: 'Entretenimento',
    icon: '🎬',
    is18Plus: false,
    pairs: {
      easy: entretenimentoGroups,
      medium: entretenimentoGroups,
      hard: entretenimentoGroups
    }
  },
  {
    id: 'jogos',
    name: 'Personagens de Jogos',
    icon: '🎮',
    is18Plus: false,
    pairs: {
      easy: jogosGroups,
      medium: jogosGroups,
      hard: jogosGroups
    }
  },
  {
    id: 'cantores',
    name: 'Cantores e Bandas',
    icon: '🎤',
    is18Plus: false,
    pairs: {
      easy: cantoresGroups,
      medium: cantoresGroups,
      hard: cantoresGroups
    }
  },
  {
    id: 'animes',
    name: 'Personagens de Anime',
    icon: '📺',
    is18Plus: false,
    pairs: {
      easy: animesGroups,
      medium: animesGroups,
      hard: animesGroups
    }
  },
  {
    id: 'relacionamentos',
    name: 'Relacionamentos',
    icon: '💕',
    is18Plus: false,
    pairs: {
      easy: relacionamentosGroups,
      medium: relacionamentosGroups,
      hard: relacionamentosGroups
    }
  },
  {
    id: 'adulto',
    name: 'Proibidão (+18)',
    icon: '🔞',
    is18Plus: true,
    pairs: {
      easy: adultoGroups,
      medium: adultoGroups,
      hard: adultoGroups
    }
  }
];

export const getThemesWithCount = () => themes.map(t => ({
  id: t.id,
  name: t.name,
  icon: t.icon,
  is18Plus: t.is18Plus,
  groupCount: t.pairs.easy.length
}));
