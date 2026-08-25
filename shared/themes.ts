import { Theme } from './types';

// Arrays de dados puros para cada tema, com no mínimo 100 grupos por tema.
const comidaGroups = [
  ['Pizza', 'Esfiha'], ['Hambúrguer', 'Sanduíche'], ['Bolo', 'Torta'], ['Café', 'Chá'],
  ['Cerveja', 'Chopp'], ['Sushi', 'Sashimi'], ['Pão de queijo', 'Coxinha'], ['Macarrão', 'Nhoque'],
  ['Feijoada', 'Churrasco'], ['Chocolate', 'Brigadeiro'], ['Suco', 'Refrigerante'], ['Biscoito', 'Bolacha'],
  ['Pudim', 'Mousse'], ['Sopa', 'Caldo'], ['Açaí', 'Cupuaçu'], ['Pastel', 'Empada'],
  ['Tapioca', 'Crepe'], ['Ketchup', 'Mostarda'], ['Arroz', 'Feijão'], ['Manteiga', 'Margarina'],
  ['Lasanha', 'Ravioli'], ['Sorvete', 'Picolé'], ['Vinho', 'Espumante'], ['Vodka', 'Tequila'],
  ['Gim', 'Rum'], ['Água com gás', 'Água sem gás'], ['Queijo', 'Presunto'], ['Mortadela', 'Salame'],
  ['Bacon', 'Linguiça'], ['Frango assado', 'Frango frito'], ['Peixe', 'Camarão'], ['Lagosta', 'Caranguejo'],
  ['Cenoura', 'Batata'], ['Cebola', 'Alho'], ['Tomate', 'Pimentão'], ['Alface', 'Couve'],
  ['Maçã', 'Pera'], ['Banana', 'Mamão'], ['Laranja', 'Tangerina'], ['Uva', 'Morango'],
  ['Melancia', 'Melão'], ['Abacaxi', 'Manga'], ['Limão', 'Maracujá'], ['Goiaba', 'Pêssego'],
  ['Ameixa', 'Cereja'], ['Abacate', 'Kiwi'], ['Amendoim', 'Castanha'], ['Nozes', 'Amêndoas'],
  ['Pipoca doce', 'Pipoca salgada'], ['Algodão doce', 'Maçã do amor'], ['Churros', 'Crepe suíço'], ['Donut', 'Croissant'],
  ['Pão francês', 'Pão de forma'], ['Pão integral', 'Pão de centeio'], ['Leite', 'Iogurte'], ['Coalhada', 'Requeijão'],
  ['Creme de leite', 'Leite condensado'], ['Geleia', 'Mel'], ['Doce de leite', 'Nutella'], ['Bife', 'Costela'],
  ['Carne moída', 'Almôndega'], ['Salsicha', 'Linguiça calabresa'], ['Cuscuz', 'Polenta'], ['Tapioca', 'Beiju'],
  ['Pamonha', 'Canjica'], ['Quentão', 'Vinho quente'], ['Paçoca', 'Pé de moleque'], ['Rapadura', 'Goiabada'],
  ['Brownie', 'Petit gâteau'], ['Cheesecake', 'Torta de limão'], ['Trufa', 'Bombom'], ['Balas', 'Chiclete'],
  ['Pirulito', 'Caramelo'], ['Ovo frito', 'Ovo cozido'], ['Omelete', 'Ovo mexido'], ['Panqueca', 'Waffle'],
  ['Mingau', 'Aveia'], ['Granola', 'Cereal'], ['Azeite', 'Óleo'], ['Vinagre', 'Limão'],
  ['Sal', 'Pimenta'], ['Açúcar', 'Adoçante'], ['Canela', 'Cravo'], ['Orégano', 'Manjericão'],
  ['Salsa', 'Cebolinha'], ['Coentro', 'Hortelã'], ['Gengibre', 'Cúrcuma'], ['Mostarda', 'Maionese'],
  ['Molho shoyu', 'Molho tarê'], ['Molho inglês', 'Pimenta de cheiro'], ['Molho de tomate', 'Extrato de tomate'], ['Farofa', 'Farinha'],
  ['Purê de batata', 'Batata frita'], ['Batata palha', 'Batata rústica'], ['Salpicão', 'Maionese de batata'], ['Strogonoff', 'Fricassê'],
  ['Yakisoba', 'Lámen'], ['Temaki', 'Uramaki'], ['Ceviche', 'Poke'], ['Taco', 'Burrito'],
  ['Guacamole', 'Nachos'], ['Churrasco grego', 'Kebab'], ['Shawarma', 'Esfiha aberta'], ['Empanada', 'Quibe'],
  ['Milho cozido', 'Pinhão'], ['Amendoim torrado', 'Semente de girassol'], ['Gengibirra', 'Kombucha'], ['Chá mate', 'Chá preto'],
  ['Leite vegetal', 'Leite sem lactose'], ['Creme de avelã', 'Pasta de amendoim'], ['Iogurte grego', 'Kefir'], ['Mirtilo', 'Framboesa'],
  ['Caju', 'Cajá'], ['Jabuticaba', 'Pitanga'], ['Seriguela', 'Umbu'], ['Graviola', 'Tamarindo'],
  ['Macadâmia', 'Pistache'], ['Castanha do Pará', 'Castanha de Caju'], ['Flocos de milho', 'Aveia em flocos'], ['Semente de chia', 'Semente de linhaça'],
];

const lugaresGroups = [
  ['Praia', 'Piscina'], ['Cinema', 'Teatro'], ['Escola', 'Faculdade'], ['Parque', 'Zoológico'],
  ['Academia', 'Clube'], ['Restaurante', 'Lanchonete'], ['Museu', 'Galeria'], ['Hotel', 'Pousada'],
  ['Cemitério', 'Hospital'], ['Shopping', 'Mercado'], ['Aeroporto', 'Rodoviária'], ['Delegacia', 'Corpo de Bombeiros'],
  ['Padaria', 'Confeitaria'], ['Igreja', 'Templo'], ['Circo', 'Parque de Diversões'], ['Estádio', 'Ginásio'],
  ['Farmácia', 'Posto de Saúde'], ['Banco', 'Lotérica'], ['Salão de beleza', 'Barbearia'], ['Mecânica', 'Borracharia'],
  ['Sorveteria', 'Açaiteria'], ['Tribunal', 'Cartório'], ['Motel', 'Hotel'], ['Estacionamento', 'Garagem'],
  ['Biblioteca', 'Livraria'], ['Papelaria', 'Lan House'], ['Banca de jornal', 'Revistaria'], ['Estúdio', 'Produtora'],
  ['Fábrica', 'Indústria'], ['Fazenda', 'Sítio'], ['Chácara', 'Rancho'], ['Floresta', 'Selva'],
  ['Montanha', 'Colina'], ['Deserto', 'Oásis'], ['Ilha', 'Península'], ['Rio', 'Lago'],
  ['Cachoeira', 'Nascente'], ['Oceano', 'Mar'], ['Caverna', 'Gruta'], ['Vulcão', 'Cratera'],
  ['Castelo', 'Palácio'], ['Forte', 'Torre'], ['Farol', 'Cais'], ['Porto', 'Marina'],
  ['Ponte', 'Viaduto'], ['Túnel', 'Passarela'], ['Avenida', 'Rua'], ['Praça', 'Jardim'],
  ['Beco', 'Viela'], ['Rodovia', 'Estrada'], ['Pedágio', 'Fronteira'], ['Bairro', 'Condomínio'],
  ['Prédio', 'Edifício'], ['Casa', 'Apartamento'], ['Mansão', 'Cabana'], ['Tenda', 'Acampamento'],
  ['Trailer', 'Motorhome'], ['Hostel', 'Albergue'], ['Orfanato', 'Asilo'], ['Creche', 'Berçário'],
  ['Prefeitura', 'Câmara'], ['Palácio do Governo', 'Congresso'], ['Embaixada', 'Consulado'], ['Base Militar', 'Quartel'],
  ['Prisão', 'Penitenciária'], ['Bunker', 'Abrigo'], ['Laboratório', 'Observatório'], ['Planetário', 'Aquário'],
  ['Boliche', 'Bilhar'], ['Kart', 'Paintball'], ['Pista de Gelo', 'Pista de Skate'], ['Campo de Golfe', 'Quadra de Tênis'],
  ['Campo de Futebol', 'Quadra de Vôlei'], ['Pista de Atletismo', 'Velódromo'], ['Hipódromo', 'Jóquei'], ['Autódromo', 'Kartódromo'],
  ['Boate', 'Balada'], ['Pub', 'Taverna'], ['Bar', 'Boteco'], ['Adega', 'Cervejaria'],
  ['Cafeteria', 'Casa de Chá'], ['Pizzaria', 'Churrascaria'], ['Rodízio', 'Self-service'], ['Food Truck', 'Quiosque'],
  ['Feira', 'Mercadão'], ['Açougue', 'Peixaria'], ['Hortifruti', 'Quitanda'], ['Floricultura', 'Viveiro'],
  ['Pet Shop', 'Veterinária'], ['Loja de Roupas', 'Sapataria'], ['Joalheria', 'Ótica'], ['Loja de Móveis', 'Loja de Eletro'],
  ['Supermercado', 'Atacadão'], ['Shopping Center', 'Galeria Comercial'], ['Estação de Metrô', 'Estação de Trem'], ['Ponto de Ônibus', 'Terminal'],
  ['Balsa', 'Ferry Boat'], ['Teleférico', 'Funicular'], ['Heliponto', 'Pista de Pouso'], ['Pier', 'Ancoradouro'],
  ['Mesquita', 'Sinagoga'], ['Santuário', 'Mosteiro'], ['Catedral', 'Capela'], ['Praça de Alimentação', 'Refeitório'],
  ['Oficina de Arte', 'Ateliê'], ['Escola de Dança', 'Estúdio de Pilates'], ['Circo de Solei', 'Teatro Mágico'], ['Parque Aquático', 'Termas'],
];

const relacionamentosGroups = [
  ['Amor', 'Paixão'], ['Casamento', 'Noivado'], ['Namoro', 'Ficada'], ['Amizade', 'Coleguismo'],
  ['Beijo', 'Abraço'], ['Carinho', 'Dengo'], ['Briga', 'Discussão'], ['Traição', 'Fidelidade'],
  ['Ciúmes', 'Inveja'], ['Saudade', 'Lembrança'], ['Encontro', 'Date'], ['Término', 'Divórcio'],
  ['Sogra', 'Cunhada'], ['Genro', 'Nora'], ['Padrasto', 'Madrasta'], ['Irmão', 'Primo'],
  ['Tio', 'Sobrinho'], ['Avô', 'Neto'], ['Pai', 'Filho'], ['Mãe', 'Filha'],
  ['Padrinho', 'Afilhado'], ['Gêmeos', 'Irmãos'], ['Amante', 'Ficante'], ['Crush', 'Paquera'],
  ['Ex-namorado', 'Ex-marido'], ['Viúvo', 'Solteiro'], ['Casado', 'Enrolado'], ['Aliado', 'Inimigo'],
  ['Sócio', 'Parceiro'], ['Chefe', 'Empregado'], ['Líder', 'Seguidor'], ['Professor', 'Aluno'],
  ['Médico', 'Paciente'], ['Cliente', 'Vendedor'], ['Vizinho', 'Síndico'], ['Ídolo', 'Fã'],
  ['Herói', 'Vilão'], ['Policial', 'Ladrão'], ['Juiz', 'Advogado'], ['Rival', 'Oponente'],
  ['Companheiro', 'Cúmplice'], ['Alma gêmea', 'Metade da laranja'], ['Carente', 'Apegado'], ['Frio', 'Distante'],
  ['Romântico', 'Sedutor'], ['Tóxico', 'Abusivo'], ['Saudável', 'Harmônico'], ['Tímido', 'Extrovertido'],
  ['Compreensão', 'Empatia'], ['Respeito', 'Tolerância'], ['Confiança', 'Segurança'], ['Sinceridade', 'Honestidade'],
  ['Mentira', 'Falsidade'], ['Perdão', 'Desculpas'], ['Mágoa', 'Ressentimento'], ['Orgulho', 'Ego'],
  ['Vingança', 'Revanche'], ['Admiração', 'Orgulho (bom)'], ['Inspiração', 'Motivação'], ['Surpresa', 'Presente'],
  ['Aliança', 'Anel de noivado'], ['Buquê', 'Flores'], ['Serenata', 'Declaração'], ['Cartão romântico', 'Carta de amor'],
  ['Jantar a dois', 'Cinema'], ['Viagem de casal', 'Lua de mel'], ['Bodas', 'Aniversário de namoro'], ['Amor à primeira vista', 'Amor platônico'],
  ['União estável', 'Morar junto'], ['Separados', 'Dando um tempo'], ['Bloqueado', 'Excluído'], ['Stalker', 'Admirador secreto'],
  ['Indireta', 'Cantada'], ['Flerte', 'Xaveco'], ['Selinho', 'Beijo de língua'], ['Chamego', 'Cafuné'],
  ['Amizade colorida', 'Friends with benefits'], ['Poliamor', 'Monogamia'], ['Relacionamento aberto', 'Trisal'], ['Swing', 'Troca de casais'],
  ['Conselheiro', 'Terapeuta de casais'], ['Cupido', 'Casamenteiro'], ['Padrinho de casamento', 'Madrinha'], ['Testemunha', 'Convidado'],
  ['Sogro', 'Cunhado'], ['Enteado', 'Enteada'], ['Meio-irmão', 'Irmão adotivo'], ['Família biológica', 'Família do coração'],
  ['Amigo virtual', 'Amigo de infância'], ['Melhor amigo', 'BFF'], ['Conhecido', 'Contato'], ['Membro do grupo', 'Panelinha'],
  ['Popular', 'Excluído'], ['Bully', 'Vítima'], ['Protetor', 'Defensor'], ['Mentor', 'Aprendiz'],
  ['Talarico', 'Fura-olho'], ['Match', 'Super like'], ['Ghosting', 'Vácuo'], ['Gado', 'Escravoceta'],
  ['Militante', 'Cancelador'], ['Hater', 'Troll'], ['Puxa-saco', 'Baba-ovo'], ['Invejoso', 'Recalcado'],
  ['Apoiador', 'Patrocinador'], ['Mecenas', 'Investidor'], ['Fofoqueiro', 'Leva e traz'], ['Dedo-duro', 'X9'],
];

const adultoGroups = [
  ['Camisinha', 'Pílula'], ['Sex Shop', 'Motel'], ['Lingerie', 'Fantasia'], ['Algemas', 'Chicote'],
  ['Vibrador', 'Plug'], ['Kamasutra', 'Orgia'], ['Boate', 'Striptease'], ['Nudes', 'Vídeo íntimo'],
  ['Tinder', 'Bumble'], ['Sugar Daddy', 'Sugar Baby'], ['Fetiche', 'BDSM'], ['Dominatrix', 'Submisso'],
  ['Menage', 'Suruba'], ['Swing', 'Troca de casais'], ['Cerveja', 'Vodka'], ['Whisky', 'Tequila'],
  ['Maconha', 'Cigarro'], ['Ressaca', 'PT (Perda Total)'], ['Bebedeira', 'Gole'], ['Vinho', 'Champanhe'],
  ['Beijo triplo', 'Beijo grego'], ['Sexo oral', 'Sexo anal'], ['Masturbação', 'Siririca'], ['Ejaculação', 'Orgasmo'],
  ['Ponto G', 'Clitóris'], ['Pênis', 'Vagina'], ['Seios', 'Bunda'], ['Lubrificante', 'Óleo de massagem'],
  ['Pole dance', 'Lap dance'], ['OnlyFans', 'Privacy'], ['Pornografia', 'Hentai'], ['Ator pornô', 'Garota de programa'],
  ['Cabaré', 'Zona'], ['Puteiro', 'Casa de massagem'], ['Chupão', 'Mordida'], ['Tapas', 'Arranhões'],
  ['Nudez', 'Exibicionismo'], ['Voyeur', 'Cuckold'], ['Cornudo', 'Ricardão'], ['Amante', 'Rapariga'],
  ['Sexting', 'Cybersexo'], ['Gemido', 'Sussurro'], ['Tesão', 'Libido'], ['Ereção', 'Impotência'],
  ['Viagra', 'Cialis'], ['Anticoncepcional', 'DIU'], ['Teste de gravidez', 'Pílula do dia seguinte'], ['DST', 'Camisinha feminina'],
  ['Fio terra', 'Golden shower'], ['Sadomasoquismo', 'Shibari'], ['Festa rave', 'After'], ['Lança-perfume', 'Poppers'],
  ['Gozada', 'Lola'], ['Boquete', 'Bquete'], ['69', 'Papai e mamãe'], ['Cachorrinho', 'Frango assado'],
  ['Rapidinha', 'Maratona sexual'], ['Fazer amor', 'Fuder'], ['Meter', 'Transar'], ['Trepar', 'Dar uns amassos'],
  ['Ficante', 'P.A. (Pau Amigo)'], ['Contato colorido', 'Amizade com benefícios'], ['Sedução', 'Provocação'], ['Tesão acumulado', 'Abstinência'],
  ['Fogo no rabo', 'Cachorrada'], ['Safadeza', 'Putaria'], ['Virgindade', 'Cabaço'], ['Perder o cabaço', 'Desvirginar'],
  ['Pau mole', 'Soca fofo'], ['Pinto', 'Xereca'], ['Cu', 'Rola'], ['Buceta', 'Piroca'],
  ['Calcinha', 'Cueca'], ['Sutiã', 'Espartilho'], ['Meia arrastão', 'Cinta liga'], ['Salto agulha', 'Bota de couro'],
  ['Brinquedo sexual', 'Dildo'], ['Bolinha tailandesa', 'Anel peniano'], ['Gargantilha', 'Coleira'], ['Mordaça', 'Venda nos olhos'],
  ['Fumar', 'Beber'], ['Ficar chapado', 'Ficar bêbado'], ['Encher a cara', 'Vomitar'], ['Amnésia alcoólica', 'Apagão'],
  ['Despedida de solteiro', 'Chá de lingerie'], ['Dança sensual', 'Strip poker'], ['Jogos de beber', 'Eu nunca'], ['Verdade ou desafio', 'Roleta russa (bebida)'],
  ['Ménage à trois', 'Poliamor'], ['Pegada', 'Amasso'], ['Kibe', 'Sapatão'], ['Gay', 'Lésbica'],
  ['Bissexual', 'Pansexual'], ['Travesti', 'Drag Queen'], ['Passivo', 'Ativo'], ['Versátil', 'Flex'],
];

const jogosGroups = [
  ['Mario', 'Luigi'], ['Sonic', 'Tails'], ['Goku', 'Vegeta'], ['Kratos', 'Atreus'],
  ['Master Chief', 'Cortana'], ['Pikachu', 'Charizard'], ['Link', 'Zelda'], ['Donkey Kong', 'Diddy Kong'],
  ['Lara Croft', 'Nathan Drake'], ['Ryu', 'Ken'], ['Scorpion', 'Sub-Zero'], ['Pac-Man', 'Ms. Pac-Man'],
  ['Crash Bandicoot', 'Spyro'], ['Cloud', 'Sephiroth'], ['Solid Snake', 'Big Boss'], ['Leon Kennedy', 'Chris Redfield'],
  ['Jill Valentine', 'Claire Redfield'], ['Joel', 'Ellie'], ['Geralt', 'Ciri'], ['Arthur Morgan', 'John Marston'],
  ['Trevor', 'Michael'], ['CJ', 'Big Smoke'], ['Ezio Auditore', 'Altaïr'], ['Marcus Fenix', 'Dominic Santiago'],
  ['Samus Aran', 'Captain Falcon'], ['Fox McCloud', 'Falco Lombardi'], ['Kirby', 'Meta Knight'], ['Bowser', 'Ganondorf'],
  ['Yoshi', 'Toad'], ['Chun-Li', 'Cammy'], ['Guile', 'Bison'], ['Goro', 'Shao Kahn'],
  ['Raiden', 'Liu Kang'], ['Johnny Cage', 'Sonya Blade'], ['Kitana', 'Mileena'], ['Mega Man', 'Zero'],
  ['Simon Belmont', 'Alucard'], ['Sora', 'Riku'], ['Dante', 'Vergil'], ['Bayonetta', 'Jeanne'],
  ['Aloy', 'Sylens'], ['Kratos', 'Ares'], ['Doomguy', 'Duke Nukem'], ['Gordon Freeman', 'Alyx Vance'],
  ['Chell', 'GLaDOS'], ['Tracer', 'Widowmaker'], ['Genji', 'Hanzo'], ['D.Va', 'Mercy'],
  ['Reaper', 'Soldier: 76'], ['Jinx', 'Vi'], ['Yasuo', 'Yone'], ['Ahri', 'Akali'],
  ['Garen', 'Darius'], ['Teemo', 'Veigar'], ['Pudge', 'Axe'], ['Juggernaut', 'Anti-Mage'],
  ['Invoker', 'Rubick'], ['Sylvanas', 'Arthas'], ['Thrall', 'Jaina'], ['Illidan', 'Malfurion'],
  ['Raynor', 'Kerrigan'], ['Zeratul', 'Artanis'], ['Diablo', 'Tyrael'], ['Malthael', 'Imperius'],
  ['Ness', 'Lucas'], ['Pit', 'Palutena'], ['Olimar', 'Captain Falcon'], ['Villager', 'Isabelle'],
  ['Shulk', 'Rex'], ['Byleth', 'Edelgard'], ['Marth', 'Roy'], ['Ike', 'Lucina'],
  ['Corrin', 'Robin'], ['Chrom', 'Tiki'], ['Terry Bogard', 'Kyo Kusanagi'], ['Iori Yagami', 'Mai Shiranui'],
  ['Haohmaru', 'Nakoruru'], ['Morrigan', 'Felicia'], ['Nemesis', 'Mr. X'], ['Pyramid Head', 'Nurse'],
  ['Slender Man', 'Jeff the Killer'], ['Freddy Fazbear', 'Springtrap'], ['Steve', 'Alex'], ['Creeper', 'Enderman'],
  ['Ender Dragon', 'Wither'], ['Terrarian', 'Guide'], ['Sans', 'Papyrus'], ['Frisk', 'Chara'],
  ['Toriel', 'Asgore'], ['Undyne', 'Alphys'], ['Hollow Knight', 'Hornet'], ['Cuphead', 'Mugman'],
  ['Ori', 'Ku'], ['Madeline', 'Badeline'], ['Zagreus', 'Hades'], ['Isaac', 'Meat Boy'],
  ['Commander Shepard', 'Garrus'], ['Liara', 'Tali'], ['Wrex', 'Mordin'], ['Vault Boy', 'Pip-Boy'],
  ['Dragonborn', 'Alduin'], ['Ulfric', 'Tullius'], ['V', 'Johnny Silverhand'], ['Adam Smasher', 'Judy Alvarez'],
];

const cantoresGroups = [
  ['Anitta', 'Ludmilla'], ['Beyoncé', 'Rihanna'], ['Justin Bieber', 'Shawn Mendes'], ['Taylor Swift', 'Selena Gomez'],
  ['Katy Perry', 'Lady Gaga'], ['Ariana Grande', 'Dua Lipa'], ['Bruno Mars', 'The Weeknd'], ['Ed Sheeran', 'Harry Styles'],
  ['Billie Eilish', 'Olivia Rodrigo'], ['Adele', 'Sam Smith'], ['Michael Jackson', 'Prince'], ['Elvis Presley', 'Frank Sinatra'],
  ['Madonna', 'Cher'], ['Whitney Houston', 'Mariah Carey'], ['Freddie Mercury', 'Elton John'], ['David Bowie', 'Mick Jagger'],
  ['Paul McCartney', 'John Lennon'], ['Kurt Cobain', 'Eddie Vedder'], ['Axl Rose', 'Jon Bon Jovi'], ['Steven Tyler', 'Bruce Springsteen'],
  ['Eminem', 'Snoop Dogg'], ['Tupac', 'Notorious B.I.G.'], ['Jay-Z', 'Kanye West'], ['Drake', 'Kendrick Lamar'],
  ['Travis Scott', 'Post Malone'], ['Cardi B', 'Nicki Minaj'], ['Doja Cat', 'Megan Thee Stallion'], ['Rosalía', 'Karol G'],
  ['Shakira', 'J Lo'], ['Ricky Martin', 'Enrique Iglesias'], ['Bad Bunny', 'J Balvin'], ['Maluma', 'Ozuna'],
  ['Daddy Yankee', 'Luis Fonsi'], ['Roberto Carlos', 'Erasmo Carlos'], ['Caetano Veloso', 'Gilberto Gil'], ['Chico Buarque', 'Milton Nascimento'],
  ['Tim Maia', 'Jorge Ben Jor'], ['Cazuza', 'Renato Russo'], ['Raul Seixas', 'Rita Lee'], ['Cássia Eller', 'Nando Reis'],
  ['Lulu Santos', 'Titãs'], ['Skank', 'Jota Quest'], ['Capital Inicial', 'Paralamas do Sucesso'], ['Legião Urbana', 'Charlie Brown Jr'],
  ['Chorão', 'Dinho Ouro Preto'], ['Ivete Sangalo', 'Claudia Leitte'], ['Daniela Mercury', 'Margareth Menezes'], ['Leo Santana', 'Xanddy'],
  ['Wesley Safadão', 'Xand Avião'], ['Gusttavo Lima', 'Luan Santana'], ['Marília Mendonça', 'Maiara e Maraisa'], ['Jorge e Mateus', 'Henrique e Juliano'],
  ['Zé Neto e Cristiano', 'Matheus e Kauan'], ['Fernando e Sorocaba', 'Victor e Leo'], ['Chitãozinho e Xororó', 'Zezé Di Camargo e Luciano'], ['Leandro e Leonardo', 'João Paulo e Daniel'],
  ['Thiaguinho', 'Péricles'], ['Zeca Pagodinho', 'Martinho da Vila'], ['Alexandre Pires', 'Belo'], ['Sorriso Maroto', 'Turma do Pagode'],
  ['Raça Negra', 'Só Pra Contrariar'], ['Ferrugem', 'Dilsinho'], ['Mumuzinho', 'Tiee'], ['Alok', 'Vintage Culture'],
  ['David Guetta', 'Calvin Harris'], ['Martin Garrix', 'Tiësto'], ['Skrillex', 'Diplo'], ['Marshmello', 'Avicii'],
  ['Daft Punk', 'The Chainsmokers'], ['Pabllo Vittar', 'Gloria Groove'], ['Lexa', 'Luísa Sonza'], ['Pedro Sampaio', 'Kevinho'],
  ['MC Poze', 'MC Hariel'], ['MC Cabelinho', 'MC Ryan SP'], ['MC IG', 'MC PH'], ['MC Kevin', 'MC Don Juan'],
  ['Filipe Ret', 'L7nnon'], ['Matuê', 'Teto'], ['Xamã', 'Baco Exu do Blues'], ['Djonga', 'Emicida'],
  ['Criolo', 'Mano Brown'], ['Racionais MCs', 'Facção Central'], ['Sabotage', 'Dexter'], ['Gabriel o Pensador', 'Marcelo D2'],
  ['Seu Jorge', 'Natiruts'], ['O Rappa', 'Cidade Negra'], ['Armandinho', 'Chimarruts'], ['Maneva', 'Planta e Raiz'],
  ['Pitty', 'Paula Toller'], ['Sandy', 'Wanessa Camargo'], ['Tiago Iorc', 'Ana Vitória'], ['Jão', 'Vitor Kley'],
];

const animesGroups = [
  ['Naruto', 'Sasuke'], ['Goku', 'Vegeta'], ['Luffy', 'Zoro'], ['Ichigo', 'Rukia'],
  ['Edward Elric', 'Alphonse Elric'], ['Saitama', 'Genos'], ['Gon', 'Killua'], ['Deku', 'Bakugo'],
  ['Tanjiro', 'Nezuko'], ['Eren', 'Mikasa'], ['Levi', 'Erwin'], ['Light Yagami', 'L'],
  ['Guts', 'Griffith'], ['Jotaro', 'Dio'], ['Giorno', 'Bruno Bucciarati'], ['Shinji', 'Asuka'],
  ['Spike Spiegel', 'Vicious'], ['Astro Boy', 'Mega Man'], ['Pikachu', 'Ash'], ['Tai', 'Agumon'],
  ['Seiya', 'Shiryu'], ['Yusuke', 'Hiei'], ['Kenshin', 'Shishio'], ['Inuyasha', 'Sesshomaru'],
  ['Yugi', 'Kaiba'], ['Gingka', 'Ryuga'], ['Tyson', 'Kai'], ['Natsu', 'Gray'],
  ['Meliodas', 'Ban'], ['Asta', 'Yuno'], ['Soma', 'Erina'], ['Kirito', 'Asuna'],
  ['Shirou', 'Saber'], ['Gintoki', 'Kagura'], ['Mob', 'Reigen'], ['Saiki Kusuo', 'Nendo'],
  ['Lelouch', 'Suzaku'], ['Simon', 'Kamina'], ['Ryuko', 'Satsuki'], ['Akame', 'Kurome'],
  ['Tohru', 'Kyo'], ['Haruhi', 'Kyon'], ['Rem', 'Ram'], ['Subaru', 'Emilia'],
  ['Aqua', 'Megumin'], ['Kazuma', 'Darkness'], ['Naofumi', 'Raphtalia'], ['Ainz', 'Albedo'],
  ['Rimuru', 'Milim'], ['Shiro', 'Sora'], ['Kaguya', 'Miyuki'], ['Chika', 'Ishigami'],
  ['Komi', 'Tadano'], ['Marin', 'Gojo'], ['Anya', 'Loid'], ['Yor', 'Yuri'],
  ['Denji', 'Makima'], ['Power', 'Aki'], ['Gojo Satoru', 'Sukuna'], ['Itadori', 'Megumi'],
  ['Nobara', 'Maki'], ['Boruto', 'Kawaki'], ['Sarada', 'Mitsuki'], ['Hinata', 'Sakura'],
  ['Kakashi', 'Obito'], ['Jiraiya', 'Tsunade'], ['Orochimaru', 'Kabuto'], ['Madara', 'Hashirama'],
  ['Pain', 'Itachi'], ['Minato', 'Kushina'], ['Gaara', 'Shikamaru'], ['Gohan', 'Piccolo'],
  ['Trunks', 'Goten'], ['Frieza', 'Cell'], ['Majin Buu', 'Broly'], ['Bulma', 'Chi-Chi'],
  ['Kuririn', 'Android 18'], ['Beerus', 'Whis'], ['Sanji', 'Usopp'], ['Nami', 'Robin'],
  ['Chopper', 'Franky'], ['Brook', 'Jinbe'], ['Law', 'Kidd'], ['Doflamingo', 'Crocodile'],
  ['Blackbeard', 'Akainu'], ['Shanks', 'Mihawk'], ['Rayleigh', 'Roger'], ['Whitebeard', 'Marco'],
  ['Zenitsu', 'Inosuke'], ['Rengoku', 'Tengen'], ['Giyu', 'Shinobu'], ['Muzan', 'Akaza'],
  ['Armin', 'Jean'], ['Sasha', 'Connie'], ['Reiner', 'Bertholdt'], ['Annie', 'Zeke'],
  ['Roy Mustang', 'Riza Hawkeye'], ['Hisoka', 'Chrollo'], ['Meruem', 'Netero'], ['Kurapika', 'Leorio'],
];

const entretenimentoGroups = [
  ['Harry Potter', 'Voldemort'], ['Batman', 'Coringa'], ['Homem-Aranha', 'Duende Verde'], ['Superman', 'Lex Luthor'],
  ['Vingadores', 'Liga da Justiça'], ['Star Wars', 'Star Trek'], ['Luke Skywalker', 'Darth Vader'], ['Yoda', 'Obi-Wan'],
  ['Senhor dos Anéis', 'Game of Thrones'], ['Frodo', 'Sam'], ['Gandalf', 'Saruman'], ['Aragorn', 'Legolas'],
  ['Jon Snow', 'Daenerys'], ['Tyrion', 'Cersei'], ['Breaking Bad', 'Better Call Saul'], ['Walter White', 'Jesse Pinkman'],
  ['Gus Fring', 'Saul Goodman'], ['Stranger Things', 'Dark'], ['Eleven', 'Demogorgon'], ['Hopper', 'Joyce'],
  ['The Office', 'Brooklyn 99'], ['Michael Scott', 'Jim Halpert'], ['Dwight', 'Pam'], ['Jake Peralta', 'Capitão Holt'],
  ['Friends', 'How I Met Your Mother'], ['Rachel', 'Monica'], ['Ross', 'Chandler'], ['Joey', 'Phoebe'],
  ['Ted Mosby', 'Barney Stinson'], ['Grey\'s Anatomy', 'House'], ['Meredith Grey', 'Derek Shepherd'], ['Dr. House', 'Wilson'],
  ['The Walking Dead', 'The Last of Us'], ['Rick Grimes', 'Daryl Dixon'], ['Negan', 'Michonne'], ['Peaky Blinders', 'Sons of Anarchy'],
  ['Thomas Shelby', 'Arthur Shelby'], ['Vikings', 'The Last Kingdom'], ['Ragnar', 'Bjorn'], ['La Casa de Papel', 'Round 6'],
  ['Professor', 'Berlim'], ['Tóquio', 'Rio'], ['Matrix', 'O Exterminador do Futuro'], ['Neo', 'Trinity'],
  ['Morpheus', 'Agente Smith'], ['John Wick', 'Jason Bourne'], ['James Bond', 'Ethan Hunt'], ['Indiana Jones', 'Tomb Raider'],
  ['Jurassic Park', 'Tubarão'], ['O Rei Leão', 'A Bela e a Fera'], ['Simba', 'Mufasa'], ['Scar', 'Timão e Pumba'],
  ['Aladdin', 'Gênio'], ['Mulan', 'Pocahontas'], ['Branca de Neve', 'Cinderela'], ['Ariel', 'Bela'],
  ['Elsa', 'Anna'], ['Woody', 'Buzz Lightyear'], ['Nemo', 'Dory'], ['Shrek', 'Burro'],
  ['Fiona', 'Gato de Botas'], ['Bob Esponja', 'Patrick'], ['Lula Molusco', 'Seu Siriguejo'], ['Os Simpsons', 'Uma Família da Pesada'],
  ['Homer', 'Bart'], ['Marge', 'Lisa'], ['Peter Griffin', 'Stewie'], ['Rick', 'Morty'],
  ['Bojack Horseman', 'South Park'], ['Cartman', 'Kenny'], ['Narcos', 'El Chapo'], ['Pablo Escobar', 'Agente Peña'],
  ['Lucifer', 'Sandman'], ['The Boys', 'Invencível'], ['Capitão Pátria', 'Billy Bruto'], ['Wolverine', 'Deadpool'],
  ['Professor X', 'Magneto'], ['Capitão América', 'Homem de Ferro'], ['Thor', 'Loki'], ['Hulk', 'Viúva Negra'],
  ['Pantera Negra', 'Doutor Estranho'], ['Wanda', 'Visão'], ['Thanos', 'Darkseid'], ['Mulher Maravilha', 'Aquaman'],
  ['Flash', 'Ciborgue'], ['Barbie', 'Oppenheimer'], ['Avatar', 'Titanic'], ['De Volta Para o Futuro', 'Caça-Fantasmas'],
  ['E.T.', 'Alien'], ['O Senhor dos Anéis', 'O Hobbit'], ['Harry Potter', 'Animais Fantásticos'], ['Jogos Vorazes', 'Divergente'],
  ['Katniss', 'Peeta'], ['Crepúsculo', 'The Vampire Diaries'], ['Edward', 'Jacob'], ['Bella', 'Alice'],
];

export const themes: Theme[] = [
  {
    id: 'comida',
    name: 'Comida e Bebida',
    icon: '🍕',
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
    icon: '📍',
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
    icon: '⛩️',
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
    icon: '❤️',
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
    icon: '🔥',
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
