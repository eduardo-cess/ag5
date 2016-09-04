#!/usr/bin/env node
console.time("time");

var fs = require('fs');
var u = require('underscore');
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
var program = require('commander');
var ag = require('./ag_class.js');
 
program
  .version('1.0.0')
  .option('-t, --tipoag [type]', 'Tipo do AG [1 = canônico, 2 = elitismo, 3 = normalização linear, 4 = normalização linear + elitismo, 5 = canônico com F6 aumentada, 6 = elitismo com F6 aumentada]\n', '1')
  .option('-c, --cruzamento [type]', 'Tipo de cruzamento [1 = 1 ponto de corte, 2 = 2 pontos de corte, 3 = uniforme]','1')
  .parse(process.argv);

const CANONICO = 1, ELITISMO = 2, NORM_LINEAR = 3, NORM_LIN_ELITISMO = 4, CANONICO_F6_MOD = 5, ELIT_F6_MOD = 6;
const UM_PONTO_CORTE = 1, DOIS_PONTO_CORTE = 2, UNIFORME = 3;

var tipo_ag = parseInt(program.tipoag);
var tipo_cruzamento = parseInt(program.cruzamento);

//ag.array_populacao_experimento = [30];

for(aux1 in ag.array_populacao_experimento){
	for(aux2 in u.range(3)){
		ag.qtd_pop = ag.array_populacao_experimento[aux1];
		ag.play_ag(tipo_ag, tipo_cruzamento);
		ag.experimento++;
		ag.zerar_variaveis();
	}
}
var data = ag.array_experimento;

switch (tipo_cruzamento) {
	case UM_PONTO_CORTE:
		var db = 'ag4_1ponto_corte';
		break;
case DOIS_PONTO_CORTE:
		var db = 'ag4_2ponto_corte';
		break;
case UNIFORME:
		var db = 'ag4_uniforme';
		break;
	default:
		;var db = 'ag4_1ponto_corte';
		break;
}

switch (tipo_ag) {
	case CANONICO:
		var collection = 'experimentos_canonico';
		break;	
	case ELITISMO:
		var collection = 'experimentos_elitismo';
		break;	
	case NORM_LINEAR:
		var collection = 'experimentos_norm_linear';
		break;	
	case NORM_LIN_ELITISMO:
		var collection = 'experimentos_norm_linear_elitismo';
		break;	
	case CANONICO_F6_MOD:
		var collection = 'experimentos_canonico_f6modificada';
		break;	
	case ELIT_F6_MOD:
		var collection = 'experimentos_elitismo_f6modificada';
		break;
	default:
		var collection = 'experimentos_canonico';
		break;
}

MongoClient.connect("mongodb://localhost:27017/"+db, function(err, db) {
	assert.equal(null, err);
	experimento_collection = db.collection(collection);
	for(i in data){
		experimento_collection.insertOne(data[i],{w:1},function(err, r) {
			assert.equal(null, err);
			assert.equal(1, r.insertedCount);
		});
	}
	db.close();
});

console.timeEnd("time");
