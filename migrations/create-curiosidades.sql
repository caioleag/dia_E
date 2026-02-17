-- Migration: Criar tabela de curiosidades
-- Data: 2026-02-16

-- Criar tabela de curiosidades
CREATE TABLE IF NOT EXISTS curiosidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conteudo TEXT NOT NULL,
  categoria VARCHAR(50),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar índice para busca rápida
CREATE INDEX idx_curiosidades_ativo ON curiosidades(ativo);

-- Habilitar RLS
ALTER TABLE curiosidades ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler curiosidades ativas
CREATE POLICY "Curiosidades são públicas"
  ON curiosidades
  FOR SELECT
  USING (ativo = true);

-- Inserir 100+ curiosidades sobre sexo e fetiche
INSERT INTO curiosidades (conteudo, categoria) VALUES
-- Fatos históricos (1-15)
('O vibrador foi inventado em 1869 para tratar "histeria feminina" - um diagnóstico médico da época.', 'historia'),
('Na Roma Antiga, era comum ter esculturas e pinturas eróticas em casas de família.', 'historia'),
('O Kama Sutra foi escrito entre 400 a.C. e 200 d.C. e contém muito mais que posições sexuais.', 'historia'),
('Cleópatra usava abelhas vivas dentro de uma caixa oca como vibrador primitivo.', 'historia'),
('Na Grécia Antiga, o falo era considerado símbolo de sorte e prosperidade.', 'historia'),
('O termo "orgasmo" vem do grego "orgasmos" que significa "inchar" ou "estar excitado".', 'historia'),
('No Egito Antigo, a masturbação era considerada um ato sagrado e de criação.', 'historia'),
('A primeira revista Playboy foi publicada em 1953 com Marilyn Monroe na capa.', 'historia'),
('No século XIX, médicos recomendavam orgasmos femininos como tratamento para insônia.', 'historia'),
('O beijo de língua era proibido em filmes hollywoodianos até 1968.', 'historia'),
('Na Idade Média, havia "cintos de castidade" feitos de metal para mulheres.', 'historia'),
('O ponto G foi nomeado em homenagem ao ginecologista alemão Ernst Gräfenberg em 1950.', 'historia'),
('Nos anos 1920, vibradores eram vendidos em catálogos da Sears como "aparelhos de massagem".', 'historia'),
('A pílula anticoncepcional foi aprovada nos EUA em 1960, revolucionando a liberdade sexual.', 'historia'),
('No Japão feudal, existiam "livros de travesseiro" ilustrados com cenas eróticas explícitas.', 'historia'),

-- Curiosidades científicas (16-35)
('O orgasmo feminino pode durar até 20 segundos, enquanto o masculino dura cerca de 6 segundos.', 'ciencia'),
('Durante o orgasmo, o cérebro libera oxitocina, dopamina, serotonina e endorfinas.', 'ciencia'),
('O clitóris possui mais de 8.000 terminações nervosas - o dobro do pênis.', 'ciencia'),
('Apenas 25% das mulheres conseguem orgasmo apenas com penetração vaginal.', 'ciencia'),
('O esperma pode sobreviver até 5 dias dentro do corpo feminino.', 'ciencia'),
('Mulheres podem ter múltiplos orgasmos sem período refratário.', 'ciencia'),
('O desejo sexual aumenta no período de ovulação devido aos hormônios.', 'ciencia'),
('Praticar sexo regularmente fortalece o sistema imunológico.', 'ciencia'),
('O orgasmo alivia dores de cabeça devido à liberação de endorfinas.', 'ciencia'),
('Pessoas que praticam sexo 3+ vezes por semana aparentam ser 10 anos mais jovens.', 'ciencia'),
('Durante a excitação, os mamilos podem crescer até 25% do tamanho normal.', 'ciencia'),
('O sexo queima aproximadamente 100 calorias em 30 minutos.', 'ciencia'),
('Mulheres têm melhor memória após orgasmos devido ao aumento de fluxo sanguíneo cerebral.', 'ciencia'),
('O cheiro do suor masculino pode afetar o ciclo menstrual feminino.', 'ciencia'),
('30% das pessoas já tiveram sonhos eróticos que resultaram em orgasmo real.', 'ciencia'),
('A libido feminina atinge o pico aos 30-40 anos, enquanto a masculina aos 18-20 anos.', 'ciencia'),
('Beijos apaixonados transferem até 80 milhões de bactérias - mas isso fortalece a imunidade!', 'ciencia'),
('O cérebro é considerado o maior órgão sexual do corpo humano.', 'ciencia'),
('Homens produzem cerca de 1.500 espermatozoides por segundo.', 'ciencia'),
('A excitação sexual pode aumentar a tolerância à dor em até 107%.', 'ciencia'),

-- Sobre fetiches (36-55)
('Fetiche por pés (podofilia) é um dos mais comuns no mundo.', 'fetiche'),
('O termo "fetiche" vem do português "feitiço" usado por navegadores do século XV.', 'fetiche'),
('BDSM é uma sigla: Bondage/Disciplina, Dominação/Submissão, Sadismo/Masoquismo.', 'fetiche'),
('Aproximadamente 47% das pessoas têm pelo menos um fetiche.', 'fetiche'),
('O fetiche por couro e látex tem origem nas sensações táteis únicas desses materiais.', 'fetiche'),
('Voyeurismo é o prazer em observar, enquanto exibicionismo é o prazer em ser observado.', 'fetiche'),
('O termo "vanilla" no meio fetichista refere-se a sexo convencional, sem fetiches.', 'fetiche'),
('Roleplay (interpretação de papéis) é uma das práticas fetichistas mais populares.', 'fetiche'),
('O movimento fetichista usa "palavras de segurança" para garantir consenso e limites.', 'fetiche'),
('Shibari é a arte japonesa de amarração erótica usando cordas de forma artística.', 'fetiche'),
('O fetiche por uniforme (militares, policiais, médicos) tem origem na admiração por autoridade.', 'fetiche'),
('Spanking (palmadas) libera endorfinas que criam uma sensação de prazer natural.', 'fetiche'),
('A comunidade BDSM possui códigos de ética rigorosos baseados em consenso mútuo.', 'fetiche'),
('Fetichismo por objetos inanimados é chamado de "objetofilia".', 'fetiche'),
('O termo "switch" refere-se a quem gosta de alternar entre dominação e submissão.', 'fetiche'),
('Tickling (cócegas) pode ser uma prática fetichista para algumas pessoas.', 'fetiche'),
('O prazer em sensações de temperatura (gelo/cera quente) é chamado de "temperature play".', 'fetiche'),
('Fetiches geralmente se desenvolvem durante a adolescência ou início da vida adulta.', 'fetiche'),
('Os fetiches mais comuns incluem: lingerie, salto alto, cabelo, músculos e tatuagens.', 'fetiche'),
('Impact play (tapas, chicotes) deve ser praticado com conhecimento de anatomia para segurança.', 'fetiche'),

-- Estatísticas interessantes (56-75)
('70% das pessoas fantasiam durante o sexo com o parceiro.', 'estatistica'),
('A fantasia sexual mais comum é fazer sexo em público ou ao ar livre.', 'estatistica'),
('54% das mulheres já tiveram orgasmos durante o sono.', 'estatistica'),
('O brasileiro é um dos povos que mais faz sexo no mundo, com média de 145 vezes/ano.', 'estatistica'),
('85% dos homens e 45% das mulheres se masturbam regularmente.', 'estatistica'),
('A duração média de uma relação sexual é de 5 a 7 minutos de penetração.', 'estatistica'),
('20% da população global se identifica como não-monogâmica.', 'estatistica'),
('O pornô representa cerca de 30% de todo o tráfego da internet.', 'estatistica'),
('Casais que conversam abertamente sobre sexo têm 5x mais orgasmos.', 'estatistica'),
('43% das mulheres já usaram ou têm interesse em brinquedos sexuais.', 'estatistica'),
('A posição sexual mais praticada no mundo é a "missionária".', 'estatistica'),
('80% das pessoas já tiveram pelo menos um orgasmo múltiplo na vida.', 'estatistica'),
('Sexting (mensagens eróticas) é praticado por 88% dos adultos entre 18-35 anos.', 'estatistica'),
('62% das pessoas acreditam que preliminares são mais importantes que penetração.', 'estatistica'),
('A libido diminui em 40% sob estresse crônico.', 'estatistica'),
('Pessoas em relacionamentos longos fazem sexo 2-3 vezes por semana em média.', 'estatistica'),
('93% das pessoas já mentiram sobre suas experiências sexuais.', 'estatistica'),
('O orgasmo feminino dura em média 23 segundos, o masculino 10 segundos.', 'estatistica'),
('62% dos homens e 57% das mulheres pensam em sexo pelo menos uma vez ao dia.', 'estatistica'),
('O sexo oral é praticado por 90% dos casais modernos.', 'estatistica'),

-- Dicas e benefícios (76-95)
('Sexo regular melhora a qualidade do sono devido aos hormônios relaxantes.', 'beneficio'),
('Orgasmos aliviam cólicas menstruais por liberarem endorfinas naturais.', 'beneficio'),
('Atividade sexual frequente reduz o risco de câncer de próstata em homens.', 'beneficio'),
('O sexo reduz ansiedade e depressão pela liberação de serotonina.', 'beneficio'),
('Preliminares aumentam em 80% a probabilidade de orgasmo feminino.', 'dica'),
('Comunicação durante o sexo aumenta a satisfação em 300%.', 'dica'),
('Variar posições, locais e horários mantém a excitação e o interesse.', 'dica'),
('Exercícios de Kegel fortalecem o assoalho pélvico e intensificam orgasmos.', 'dica'),
('Lubrificante adequado melhora 90% das experiências sexuais.', 'dica'),
('Concentrar-se nas sensações do momento aumenta o prazer e conexão.', 'dica'),
('Sexo matinal aumenta energia e melhora o humor para o dia todo.', 'beneficio'),
('Orgasmos fortalecem músculos pélvicos e melhoram controle da bexiga.', 'beneficio'),
('Atividade sexual aumenta a produção de testosterona em ambos os sexos.', 'beneficio'),
('O sexo melhora a circulação sanguínea e saúde cardiovascular.', 'beneficio'),
('Tocar e acariciar aumenta produção de ocitocina, o "hormônio do amor".', 'beneficio'),
('Sexo regular ajuda a manter pele jovem e cabelos saudáveis.', 'beneficio'),
('A intimidade física fortalece vínculos emocionais entre casais.', 'beneficio'),
('Explorar zonas erógenas menos óbvias pode resultar em novos prazeres.', 'dica'),
('Criar um ambiente relaxante (luz, música) aumenta excitação e prazer.', 'dica'),
('Brinquedos sexuais podem ser usados sozinho ou em casal para variar.', 'dica'),

-- Curiosidades culturais (96-115)
('No Butão, faz parte da cultura ter desenhos de pênis nas paredes de casas para dar sorte.', 'cultura'),
('A Holanda foi o primeiro país a legalizar casamento gay, em 2001.', 'cultura'),
('Em algumas tribos indígenas, rituais sexuais fazem parte de celebrações sagradas.', 'cultura'),
('O Tantra é uma filosofia oriental que conecta sexualidade com espiritualidade.', 'cultura'),
('No Japão, existe um festival anual celebrando o falo ("Kanamara Matsuri").', 'cultura'),
('A Suécia oferece educação sexual obrigatória desde os 7 anos de idade.', 'cultura'),
('Em Mumbai, existe um museu dedicado exclusivamente ao sexo e erotismo.', 'cultura'),
('Culturas polinésias celebram a sexualidade como parte natural da vida desde cedo.', 'cultura'),
('Na Dinamarca, é comum ver estátuas de bronze em poses eróticas em locais públicos.', 'cultura'),
('O Kama Sutra descreve 64 artes diferentes além do sexo, incluindo culinária e poesia.', 'cultura'),
('Alguns povos africanos realizam cerimônias de fertilidade com danças eróticas.', 'cultura'),
('Na França, "cinq à sept" é o horário tradicional (17h-19h) para encontros extraconjugais.', 'cultura'),
('A Tailândia é famosa por seus shows eróticos em Patpong, Bangkok.', 'cultura'),
('Em Amsterdã, o Distrito da Luz Vermelha é um museu vivo de cultura sexual.', 'cultura'),
('Culturas nórdicas têm saunas mistas como prática social natural e não-sexual.', 'cultura'),
('No Brasil, o Carnaval é globalmente conhecido por sua liberdade e sensualidade.', 'cultura'),
('A Índia antiga tinha templos com esculturas eróticas detalhadas (Khajuraho).', 'cultura'),
('Em Berlim, existe o Museu do Erotismo com mais de 5.000 peças históricas.', 'cultura'),
('Algumas tribos amazônicas praticam poliamor como estrutura familiar aceita.', 'cultura'),
('O conceito de "amor livre" dos anos 60 revolucionou atitudes sobre monogamia.', 'cultura');

-- Comentário de finalização
COMMENT ON TABLE curiosidades IS 'Curiosidades educativas sobre sexualidade e fetiche para exibir na home do app';
