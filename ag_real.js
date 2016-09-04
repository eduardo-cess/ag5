var m = require('mathjs');
var _ = require('underscore');

var populacao=[], aptidaoPopulacao=[], aptidaoSomaArray=[], pais=[], filhos=[], melhorIndividuo=[];
var qtdIndividuos = 200, qtdGeracoes = 200, tcruzamento = 0.75, tmutacao = 0.01, melhorAptidao = -100;

playAg();

function playAg(){
	inicializar();
	avaliar();
	for(geracao in _.range(qtdGeracoes)){
		reproduzir();
		avaliar();
		console.log('geração: '+geracao);
	}
	console.log('Melhor aptidão: '+ melhorAptidao);
}

function inicializar(){
	var x, y, individuo = [];
	for(i in _.range(qtdIndividuos)){
		x = m.random(-100, 100);
		y = m.random(-100, 100);
		individuo.push(x);
		individuo.push(y);
		populacao.push(individuo);
		individuo = [];
	}
}

function f6(x,y){
	var scope = {x: x, y: y};
	return m.eval('0.5-(((sin(sqrt(x^2+y^2)))^2)-0.5)/(1+0.001*(x^2+y^2))^2',scope);
}

function avaliar(){
	var aptidaoIndividuo;
	for(i in populacao){
		aptidaoIndividuo = f6(populacao[i][0],populacao[i][1]);
		aptidaoPopulacao.push(aptidaoIndividuo);
		if(aptidaoIndividuo > melhorAptidao){
			melhorAptidao = aptidaoIndividuo;
			melhorIndividuo = populacao[i];
		}

	}
}

function selecionarPais(totalAptidao){
	var rand = m.random(0,totalAptidao);

	for(i in aptidaoSomaArray){
		if (aptidaoSomaArray[i] >= m.random(0,totalAptidao)){
			pais.push(populacao[i]);
			rand = m.random(0,totalAptidao);
		}
		if(pais.length == 2)
			break;
	}
	if(pais.length < 2)
		selecionarPais(totalAptidao);
}

function roleta(){
	var totalAptidao = 0;
	for(i in aptidaoPopulacao){
		totalAptidao += aptidaoPopulacao[i];
		aptidaoSomaArray.push(totalAptidao);
	}
	return totalAptidao;
}

function reproduzir(){
	selecionarPais(roleta());
	while(filhos.length < populacao.length){
		if(Math.random() <= tcruzamento){
			cruzamento();
			selecionarPais(roleta());
		}
	}

	populacao = [];aptidaoSomaArray = [];
	populacao = filhos;
	mutacao();
	populacao[0] = melhorIndividuo;
}

function cruzamento(){
	var filho=[];
	filho.push((pais[0][0]+pais[1][0])/2);
	filho.push((pais[0][1]+pais[1][1])/2);
	filhos.push(filho);
	filho = [];
	filho.push((pais[1][1]+pais[0][1])/2);
	filho.push((pais[0][0]+pais[1][0])/2);
	filhos.push(filho);
	filho = [];
}

function mutacao(){
	for(i in populacao){
		for(j in populacao[i]){
			if(Math.random() <= tmutacao){
				populacao[i][j] += m.random(-10, 10);
			}
		}
	}
}
