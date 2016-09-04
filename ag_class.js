var m = require('mathjs');
var u = require('underscore');

ag_class = function(){}

ag_class.prototype.array_populacao_experimento = [300, 300, 300, 300, 300, 300, 300, 300, 300, 300];
ag_class.prototype.array_experimento = [];
ag_class.prototype.experimento = 1
ag_class.prototype.tc = 0.75;
ag_class.prototype.tm = 0.01;
ag_class.prototype.qtd_geracoes = 100;
ag_class.prototype.qtd_pop = 0;
ag_class.prototype.qtd_bits = 50;
ag_class.prototype.melhor_aptidao = 0.0;
ag_class.prototype.pop = [];
ag_class.prototype.aptdao_sum = [];
ag_class.prototype.pais = [];
ag_class.prototype.aptidao_pop = [];
ag_class.prototype.filhos = [];
ag_class.prototype.mais_apto = [];
ag_class.prototype.aptidao_normalizada = [];
ag_class.prototype.aptidao_pop_total_experimento = [];
ag_class.prototype.melhor_individuo_geracao = [];
ag_class.prototype.pior_individuo_geracao = [];
ag_class.prototype.media_individuo_geracao = [];
ag_class.prototype.qtd_mutacoes_experimento = 0, cont_geracao = 0;

ag_class.prototype.zerar_variaveis = function(){
	this.pop = [];
	this.aptdao_sum = [];
	this.pais = [];
	this.aptidao_pop = [];
	this.filhos = [];
	this.mais_apto = [];
	//this.aptidao_pop_total_experimento = []; 
	this.melhor_individuo_geracao = [];
	this.pior_individuo_geracao = [];
	this.media_individuo_geracao = [];
	this.aptidao_normalizada = [];
	this.qtd_mutacoes_experimento = 0; 
	this.cont_geracao = 0; 
	this.melhor_aptidao = 0.0;
}

ag_class.prototype.play_ag = function(tipo_ag, tipo_cruzamento){
	var tipo = '';
	this.inicializar(this.qtd_pop, this.qtd_bits, tipo_ag);
	this.avaliar(tipo_ag);
	for(geracao in u.range(parseInt(this.qtd_geracoes)-1)){
		this.cont_geracao = parseInt(geracao) + 1;
		this.reproduzir(tipo_ag, tipo_cruzamento);
		this.avaliar(tipo_ag);
		this.print_info(tipo_ag, tipo_cruzamento);
	}
	console.log('Melhor aptidão: '+this.melhor_aptidao);
  
  	var info_to_insert = {
  		'_id': this.experimento,
  		//'geracoes': this.aptidao_pop_total_experimento, 
  		'melhor_individuo': this.melhor_aptidao, 
  		'qtd_mutacoes:': this.qtd_mutacoes_experimento,
  		'populacao_inicial': this.qtd_pop,
  		'melhor_por_geracao': this.melhor_individuo_geracao,
  		'pior_por_geracao': this.pior_individuo_geracao,
  		'media_por_geracao': this.media_individuo_geracao,
  	};

  	this.array_experimento.push(info_to_insert);
}

ag_class.prototype.print_info = function(tipo_ag, tipo_cruzamento){
	if(tipo_ag == 2) tipo = 'Elitismo';
	else if(tipo_ag == 3)	tipo = 'Normalização Linear';
	else if(tipo_ag == 4)	tipo = 'Normalização Linear + Elitismo';
	else if(tipo_ag == 5)	tipo = 'Canônico com f6+999';
	else if(tipo_ag == 6)	tipo = 'Elitismo com f6+999';
	else tipo = 'Canônico';
	if(tipo_cruzamento == 1) cruzamento = 'Um Ponto de Corte';
	else if(tipo_cruzamento == 2) cruzamento = 'Dois Pontos de Corte';
	else cruzamento = 'Uniforme';
	console.log('Tipo: '+tipo+' -- Cruzamento: '+cruzamento+' -- experimento/geração: '+this.experimento+'/'+this.cont_geracao);
}

ag_class.prototype.norm_linear = function(){
	var min=1,max=1.001;
	for(i in u.range(this.qtd_pop))
		this.aptidao_normalizada.push(min+(max-min)/(this.qtd_pop-1)*(i-1));
}

ag_class.prototype.bin2Float = function(binary){
	var scope = {l: binary.length, xmin: -100,	xmax: 100, i: parseInt(binary, 2)};
	return m.eval('xmin+(i*(xmax-xmin)/((2^l)-1))',scope);
}

ag_class.prototype.f6 = function(x,y,tipo_ag){
	var scope = {x: x, y: y};
	if(tipo_ag == 1 || tipo_ag == 2)
		return m.eval('0.5-(((sin(sqrt(x^2+y^2)))^2)-0.5)/(1+0.001*(x^2+y^2))^2',scope);
	else
		return m.eval('999+0.5-(((sin(sqrt(x^2+y^2)))^2)-0.5)/(1+0.001*(x^2+y^2))^2',scope);
}

ag_class.prototype.inicializar = function(qtd_pop, qtd_bits, tipo_ag){
	var cromossomo = [];
	for(i in u.range(qtd_pop)){
		for(j in u.range(qtd_bits))
			cromossomo.push(m.randomInt(2));
		this.pop.push(cromossomo);
		cromossomo = [];
	}
	if(tipo_ag == 3 || tipo_ag == 4)
		this.norm_linear();
}

ag_class.prototype.bubble_sort_pop = function(a){
	var swapped, temp, temp_pop;
	do {
		swapped = false;
		for (var i=0; i < a.length-1; i++) {
			if (a[i] > a[i+1]) {
				temp = a[i];
				a[i] = a[i+1];
				a[i+1] = temp;
				
				temp_pop = this.pop[i];
				this.pop[i] = this.pop[i+1];
				this.pop[i+1] = temp_pop;

				swapped = true;
			}
		}
	} while (swapped);
}

ag_class.prototype.avaliar = function(tipo_ag){
	var x, x_string, y, y_string, aptidao_individuo, melhor_da_geracao = 0.0, pior_da_geracao = 10000.0;
	var sum_aptidao = 0.0;
	for(i in this.pop){
		x = this.pop[i].slice(0,25);
		y = this.pop[i].slice(25,50);	
		x_string = String(x).replace(/,/g , "");
		y_string = String(y).replace(/,/g , "");
		aptidao_individuo = this.f6(this.bin2Float(x_string),this.bin2Float(y_string),tipo_ag);
		this.aptidao_pop.push(aptidao_individuo);
		//this.aptidao_pop_total_experimento.push({'individuo':aptidao_individuo,'geracao':this.cont_geracao});
		if(aptidao_individuo > melhor_da_geracao)
			melhor_da_geracao = aptidao_individuo;
		if(aptidao_individuo < pior_da_geracao)
			pior_da_geracao = aptidao_individuo;
	}
	
	if(tipo_ag == 3 || tipo_ag == 4)
		this.bubble_sort_pop(this.aptidao_pop);
	for(i in this.aptidao_pop)
		sum_aptidao+=this.aptidao_pop[i];

	this.media_individuo_geracao.push(sum_aptidao/this.aptidao_pop.length);
	this.melhor_individuo_geracao.push(melhor_da_geracao);
	this.pior_individuo_geracao.push(pior_da_geracao);
}

ag_class.prototype.reproduzir = function(tipo_ag, tipo_cruzamento){
	var soma_aptidao = 0;
	var array_aptidao = (tipo_ag != 3 && tipo_ag != 4) ? this.aptidao_pop : this.aptidao_normalizada;
	this.aptdao_sum = [];
	this.filhos=[];

	for(i in array_aptidao){
		soma_aptidao += array_aptidao[i];
		this.aptdao_sum.push(soma_aptidao);
	}
	this.selecionar(soma_aptidao);

	while(this.filhos.length < this.pop.length){
		if(Math.random() <= this.tc){
			this.cruzamento(this.qtd_bits,tipo_cruzamento);
			this.selecionar(soma_aptidao);
		}
	}
	if (tipo_ag == 2 || tipo_ag == 4 || tipo_ag == 6)
		this.filhos[0] = this.mais_apto;//elitismo

	this.aptidao_pop = [];
	this.pop = [];
	this.pop = this.filhos;

	this.mutacao();
}

ag_class.prototype.cruzamento = function(qtd_bits, tipo_cruzamento){
	var filho;
	if(tipo_cruzamento == 1){
		var ponto_corte = m.randomInt(qtd_bits);//ponto de corte aleatorio
		filho = this.pais[0].slice(0,ponto_corte)+this.pais[1].slice(ponto_corte,qtd_bits);
		this.filhos.push(String(filho).replace(/,/g , ""));
		filho = '';
		filho = this.pais[1].slice(0,ponto_corte)+this.pais[0].slice(ponto_corte,qtd_bits);
		this.filhos.push(String(filho).replace(/,/g , ""));
		filho = '';
	}else if(tipo_cruzamento == 2){
		var ponto_corte_1, ponto_corte_2, max_corte_1 = parseInt(qtd_bits*(90/100));
		ponto_corte_1 = m.randomInt(1,max_corte_1);
		ponto_corte_2 = m.randomInt(max_corte_1, qtd_bits-1);
		filho = this.pais[0].slice(0,ponto_corte_1)+this.pais[1].slice(ponto_corte_1,ponto_corte_2)+this.pais[0].slice(ponto_corte_2,qtd_bits);
		this.filhos.push(String(filho).replace(/,/g , ""));
		filho = '';
		filho = this.pais[1].slice(0,ponto_corte_1)+this.pais[0].slice(ponto_corte_1,ponto_corte_2)+this.pais[1].slice(ponto_corte_2,qtd_bits);
		this.filhos.push(String(filho).replace(/,/g , ""));
		filho = '';
	}else if(tipo_cruzamento == 3){
		var padrao = 0, filho1 = [], filho2 =[];
		for(i in u.range(qtd_bits)){
			padrao = m.randomInt(2);
			if(padrao == 1){
				filho1.push(this.pais[0][i]);
				filho2.push(this.pais[1][i]);
			}else{
				filho1.push(this.pais[1][i]);
				filho2.push(this.pais[0][i]);
			}
		}
		this.filhos.push(filho1);
		this.filhos.push(filho2);
	}
	this.pais = [];
}

ag_class.prototype.mutacao = function(){
	for(i in this.pop){
		if(i > 0){
			for(j in this.pop[i]){
				if(Math.random() <= this.tm){
					this.pop[i][j] = (this.pop[i][j] == 0) ? 1 : 0;
					this.qtd_mutacoes_experimento++;
				}
			}
		}
	}
}

ag_class.prototype.selecionar = function(soma_aptidao){
	this.select_mais_apto();
	var rand = m.random(0,soma_aptidao);

	for(i in this.aptdao_sum){
		if (this.aptdao_sum[i] >= rand){
			this.pais.push(this.pop[i]);
			rand = m.random(0,soma_aptidao);
		}
		if(this.pais.length == 2)
			break;
	}
	if(this.pais.length < 2)
		this.selecionar(soma_aptidao);
}

ag_class.prototype.select_mais_apto = function(){
	for(i in this.aptidao_pop){
		if(this.aptidao_pop[i] > this.melhor_aptidao){
			this.mais_apto = this.pop[i];
			this.melhor_aptidao = this.aptidao_pop[i];
		}
	}
}

module.exports = new ag_class;