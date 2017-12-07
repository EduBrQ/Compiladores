var VAZIO = "ε";
var conjuntoFirst = {};
var conjuntoFollow = {};

function montarConjuntoFirsts(gramatica) {
    conjuntoFirst = {};
    montarConjunto(firstOf);
}

function firstOf(symbol) {

    // Um conjunto já pode ser construído a partir de alguma análise anterior
    // de um RHS, então verifique se ele já está lá e não reconstruir.
    if (conjuntoFirst[symbol]) {
        return conjuntoFirst[symbol];
    }

    // Else Inicie e calcula.
    var first = conjuntoFirst[symbol] = {};

    // Se é um terminal, seu primeiro conjunto é apenas ele próprio.
    if (isTerminal(symbol)) {
        first[symbol] = true;
        return conjuntoFirst[symbol];
    }

    var producoesParaSimbolo = getProducoesParaSimbolo(symbol);
    for (var k in producoesParaSimbolo) {
        var producao = getRHS(producoesParaSimbolo[k]);

        for (var i = 0; i < producao.length; i++) {
            var simboloProducao = producao[i];

            // Vazio vai para o conjunto first.
            if (simboloProducao === VAZIO) {
                first[VAZIO] = true;
                break;
            }

            // Else, o primeiro é um não-terminal,
            // então o primeiro é o first de nosso símbolo
            // (a menos que seja um vazio).
            var firstOfNonTerminal = firstOf(simboloProducao);

            // Se o primeiro não-terminal da produção RHS não
            // contém vazio, então basta mesclar o seu conjunto com o nosso.
            if (!firstOfNonTerminal[VAZIO]) {
                merge(first, firstOfNonTerminal);
                break;
            }

            // Else (nós temos vazio no primeiro não-terminal),
            //
            // - junte tudo exceto vazio
            // - elimine este não-terminal e avance para o próximo símbolo
            // (ou seja, não quebre este loop)
            merge(first, firstOfNonTerminal, [VAZIO]);
            // não quebre, vá para o próximo `simboloProducao`.
        }
    }

    return first;
}

function getProducoesParaSimbolo(symbol) {
    var producoesParaSimbolo = {};
    for (var k in gramatica) {
        if (gramatica[k][0] === symbol) {
            producoesParaSimbolo[k] = gramatica[k];
        }
    }
    return producoesParaSimbolo;
}

/**
 * Dada a produção `S -> F`, retorna `S`.
 */
function getLHS(producao) {
    return producao.split('->')[0].replace(/\s+/g, '');
}

/**
 * Dada a produção `S -> F`, retorna `F`.
 */
function getRHS(producao) {
    return producao.split('->')[1].replace(/\s+/g, '');
}

function montarConjutoFollow(gramatica) {
    conjuntoFollow = {};
    montarConjunto(followOf);
}

function followOf(symbol) {

    // Se já foi calculado de algum inicio anterior.
    if (conjuntoFollow[symbol]) {
        return conjuntoFollow[symbol];
    }

    // senao inicia e calcula
    var follow = conjuntoFollow[symbol] = {};

    // O símbolo de início sempre contém `$` no seu conjunto de seguimento.
    if (symbol === SIMBOLO_INICIAL) {
        follow['$'] = true;
    }

    // Precisamos analisar todas as produções onde nosso
    // símbolo é usado (ou seja, onde aparece no RHS).
    var producoesComSimbolo = getProducoesComSimbolo(symbol);
    for (var k in producoesComSimbolo) {
        var producao = producoesComSimbolo[k];
        var RHS = getRHS(producao);

        // Obter o símbolo de seguimento do nosso símbolo.
        var symbolIndex = RHS.indexOf(symbol);
        var followIndex = symbolIndex + 1;

        // Precisamos obter o Follow, que pode ser `$` ou
        // pode conter vazio em seu First. Se contiver vazio, então
        // devemos procurar o proximo Follow : `A -> aBCD`: se` C` então
        // follow de `B`) pode ser vazio, devemos considerar o First de `D` também
        // como o Follow de `B`.
        while (true) {

            if (followIndex === RHS.length) { // "$"
                var LHS = getLHS(producao);
                if (LHS !== symbol) { // Para evitar casos como: B -> aB
                    merge(follow, followOf(LHS));
                }
                break;
            }

            var followSymbol = RHS[followIndex];

            // Follow do nosso símbolo é qualquer coisa no first do seguinte símbolo:
            // followOf(symbol) é -> firstOf(followSymbol), exceto o Vazio.
            var firstOfFollow = firstOf(followSymbol);

            // Se não há vazio, basta mesclar
            if (!firstOfFollow[VAZIO]) {
                merge(follow, firstOfFollow);
                break;
            }

            merge(follow, firstOfFollow, [VAZIO]);
            followIndex++;
        }
    }

    return follow;
}

function montarConjunto(builder) {
    for (var k in gramatica) {
        builder(gramatica[k][0]);
    }
}

/**
   * Encontra producoes onde um não-terminal é usado. Para o
   * símbolo `S` encontra producao` (S + F) `, e para o símbolo` F`
   * encontra a producao `F` e `(S + F)`.
 */
function getProducoesComSimbolo(symbol) {
    var producoesComSimbolo = {};
    for (var k in gramatica) {
        var producao = gramatica[k];
        var RHS = getRHS(producao);
        if (RHS.indexOf(symbol) !== -1) {
            producoesComSimbolo[k] = producao;
        }
    }
    return producoesComSimbolo;
}

function isTerminal(symbol) {
    return !/[A-Z]/.test(symbol);
}

function merge(to, from, exclude) {
    exclude || (exclude = []);
    for (var k in from) {
        if (exclude.indexOf(k) === -1) {
            to[k] = from[k];
        }
    }
}

function printGramatica(gramatica) {
    console.log('Gramatica:\n');
    for (var k in gramatica) {
        console.log('  ', gramatica[k]);
    }
    console.log('');
}

function printSet(name, set) {
    console.log(name + ': \n');
    for (var k in set) {
        console.log('  ', k, ':', Object.keys(set[k]));
    }
    console.log('');
}


var gramatica = {
    1: 'S -> A)',
    2: 'B -> ;XB',
    3: 'B -> ε',
    4: 'C -> Y',
    5: 'A -> CB',
    6: 'A -> B',
    7: 'X -> e',
    8: 'Y -> a'
};
var SIMBOLO_INICIAL = 'E';

printGramatica(gramatica);

montarConjuntoFirsts(gramatica);
printSet('Conjunto de Firsts', conjuntoFirst);

montarConjutoFollow(gramatica);
printSet('Conjunto de Follows', conjuntoFollow);