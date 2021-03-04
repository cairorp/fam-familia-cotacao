import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, retry} from 'rxjs/operators';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {environment} from '../../../environments/environment';
import * as moment from 'moment';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {Contrato} from './model/contrato';
import {Cobertura} from './model/cobertura';

export interface TipoAssociado {
  id: number;
  descricao: string;
  agravo: number;
  limiteCapital: number;
}

export interface LimitePorIdade {
  idade: number;
  seguroMorte: number;
  seguroIfpd: number;
  seguroDoencaGrave: number;
}

export interface Segmento {
  id: number;
  descricao: string;
  tiposAssociados: TipoAssociado[];
}

export interface LimiteCapitalPorCobertura {
  id: number;
  descricao: string;
  porcentagem: number;
  valorFixo: number;
  valorMaximo: number;
}

export interface Profissao {
  descricao: string;
  limiteCapital: number;
  agravo: number;
}

export interface Taxa {
  idade: number;
  coberturas: TaxaPorCobertura[];
}

export interface TaxaPorCobertura {
  id: number;
  taxa: number;
}

@Component({
  selector: 'app-cotacao',
  styleUrls: ['cotacao.component.css'],
  templateUrl: 'cotacao.component.html'
})
export class CotacaoComponent implements OnInit {
  urlBase = `${environment.url}`;
  segmentos: Segmento[] = [];
  tiposAssociados: TipoAssociado[] = [];
  limitesPorIdade: LimitePorIdade[] = [];
  profissoes: Profissao[] = [];
  taxasPorCobertura: Taxa[] = [];
  limiteCapitalPorCobertura: LimiteCapitalPorCobertura[] = [];
  cotacaoForm: FormGroup;
  valorMaximo = Number(`${environment.valorMinimoSeguro}`);
  valorMinimo = Number(`${environment.valorMinimoSeguro}`);
  contrato = new Contrato();
  ehValido = false;
  autenticado = false;

  valorIof = Number(`${environment.iof}`);

  constructor(private http: HttpClient,
              private formBuilder: FormBuilder,
              private notification: NzNotificationService) {
    this.cotacaoForm = this.formBuilder.group({
      segmento: new FormControl('', [Validators.required]),
      tipoAssociado: new FormControl('', [Validators.required]),
      dataNascimento: new FormControl('', [Validators.required]),
      profissao: new FormControl('', [Validators.required]),
      valorEscolhido: new FormControl(this.valorMinimo),
      coberturaIpa: new FormControl(false),
      coberturaIfc: new FormControl(false),
      coberturaIff: new FormControl(false),
      coberturaDecessosIndividual: new FormControl(false),
      coberturaDecessosFamilia: new FormControl(false),
      coberturaIfpd: new FormControl(false),
      coberturaDoencasGraves: new FormControl(false),
      coberturaCancer: new FormControl(false)
    });

    this.montarContratoInicial();
  }

  ngOnInit(): void {
    this.getVinculos().subscribe(segmentos => {
      this.segmentos = segmentos;
    });
    this.getProfissoes().subscribe(profissoes => {
      this.profissoes = profissoes;
    });
    this.getLimitesPorIdade().subscribe(limitesPorIdade => {
      this.limitesPorIdade = limitesPorIdade;
    });

    this.getLimitesCapitaisPorCobertura().subscribe(limiteCapitalPorCobertura => {
      this.limiteCapitalPorCobertura = limiteCapitalPorCobertura;
    });

    this.getTaxasPorCobertura().subscribe(taxas => {
      this.taxasPorCobertura = taxas;
    });

    this.cotacaoForm.valueChanges.subscribe(() => {
      this.definirValores();
    });
  }

  montarContratoInicial() {
    this.contrato = new Contrato();
    this.contrato.coberturaBasica = this.getCoberturasBasicas();
    this.contrato.coberturaOpcional = this.getCoberturasOpcionais();
  }

  getLimitesPorIdade(): Observable<LimitePorIdade[]> {
    return this.http.get<LimitePorIdade[]>(this.urlBase + '/limitesPorIdade')
      .pipe(retry(2), catchError(this.handleError));
  }

  getVinculos(): Observable<Segmento[]> {
    return this.http.get<Segmento[]>(this.urlBase + '/segmentos')
      .pipe(retry(2), catchError(this.handleError));
  }

  getProfissoes(): Observable<Profissao[]> {
    return this.http.get<Profissao[]>(this.urlBase + '/profissoes')
      .pipe(retry(2), catchError(this.handleError));
  }

  getLimitesCapitaisPorCobertura() {
    return this.http.get<LimiteCapitalPorCobertura[]>(this.urlBase + '/limiteCapitalPorCobertura')
      .pipe(retry(2), catchError(this.handleError));
  }

  getTaxasPorCobertura() {
    return this.http.get<Taxa[]>(this.urlBase + '/taxas');
  }

  // tslint:disable-next-line:typedef
  handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Erro ocorreu no lado do client
      errorMessage = error.error.message;
    } else {
      // Erro ocorreu no lado do servidor
      errorMessage = `Código do erro: ${error.status}, ` + `menssagem: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }

  carregarTiposAssociados() {
    this.tiposAssociados = [];
    this.cotacaoForm.controls.tipoAssociado.reset();
    if (this.cotacaoForm.controls.segmento.value) {
      this.tiposAssociados = this.cotacaoForm.controls.segmento.value.tiposAssociado;
    }
  }

  formatarValorParaReal(valor: number) {
    return new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(valor);
  }

  validarDataNascimento(isOpen: boolean) {
    if (!isOpen &&
      this.cotacaoForm.controls.dataNascimento &&
      this.getIdadePorDataDeNascimento() > Number(`${environment.idadeMaxima}`)) {
      this.cotacaoForm.controls.dataNascimento.reset();
      this.criarNotificacao('warning', `A idade informada é maior que ${environment.idadeMaxima} anos.`);
    } else if (!isOpen &&
      this.cotacaoForm.controls.dataNascimento &&
      this.getIdadePorDataDeNascimento() < Number(`${environment.idadeMinima}`)) {
      this.cotacaoForm.controls.dataNascimento.reset();
      this.criarNotificacao('warning', `A idade informada é menor que ${environment.idadeMinima} anos.`);
    }
  }

  getIdadePorDataDeNascimento() {
    return moment().diff(this.getDataNascimento(), 'years');
  }

  getDataNascimento() {
    return this.cotacaoForm.controls.dataNascimento.value;
  }

  criarNotificacao(tipo: string, corpo: string): void {
    this.notification.create(
      tipo,
      this.getTituloAlerta(tipo),
      corpo
    );
  }

  definirValores() {
    if (this.cotacaoForm.valid) {
      if (this.getAtributosForm().segmento.valueChanges ||
        this.getAtributosForm().tipoAssociado.valueChanges ||
        this.getAtributosForm().dataNascimento.valueChanges ||
        this.getAtributosForm().profissao.valueChanges) {
        this.valorMaximo = this.getValorMaximoPermitido();
        this.contrato.agravo = this.getAgravo();
      }
      this.calcularValoresCotacao();
      this.ehValido = true;
    } else if (this.cotacaoForm.invalid &&
      this.cotacaoForm.invalid === this.ehValido) {
      this.ehValido = false;
      this.resetarDados();
    }
  }

  resetarDados() {
    if (this.cotacaoForm.invalid) {
      this.getAtributosForm().valorEscolhido.setValue(this.valorMinimo);
      this.montarContratoInicial();
    }
  }

  calcularValoresCotacao() {
    this.contrato.valor = 0;
    let tx = this.taxasPorCobertura.find(taxa => taxa.idade === this.getIdadePorDataDeNascimento());
    // @ts-ignore
    this.calcularCoberturasBasicas(tx);
    // @ts-ignore
    this.calcularCoberturasOpcionais(tx);
  }

  calcularCoberturasOpcionais(tx: TaxaPorCobertura) {
    this.contrato.coberturaOpcional.forEach(cobertura => {
      let limitePorCobertura = this.getLimitePorCoberturaById(cobertura.id);
      // @ts-ignore
      cobertura.capitalPorCobertura = this.calcularValorCobertura(limitePorCobertura);

      // @ts-ignore
      let cb = tx.coberturas.find(c => c.id === cobertura.id);
      // @ts-ignore
      let vl = cb.taxa * cobertura.capitalPorCobertura;
      let vlAgravo = vl * this.contrato.agravo;
      // @ts-ignore
      cobertura.valor = vl + vlAgravo + ((vl + vlAgravo) * this.valorIof);

      // @ts-ignore
      if (this.cotacaoForm.get(cobertura.rotulo).value) {
        this.contrato.valor = this.contrato.valor + cobertura.valor;
      }
    });
  }

  calcularCoberturasBasicas(tx: TaxaPorCobertura) {
    this.contrato.coberturaBasica.forEach(cobertura => {
      let limitePorCobertura = this.getLimitePorCoberturaById(cobertura.id);
      // @ts-ignore
      cobertura.capitalPorCobertura = this.calcularValorCobertura(limitePorCobertura);
      // @ts-ignore
      let cb = tx.coberturas.find(c => c.id === cobertura.id);
      // @ts-ignore
      let vl = cb.taxa * cobertura.capitalPorCobertura;
      let vlAgravo = vl * this.contrato.agravo;
      // @ts-ignore
      cobertura.valor = vl + vlAgravo + ((vl + vlAgravo) * this.valorIof);

      this.contrato.valor = this.contrato.valor + cobertura.valor;
    });
  }

  getLimitePorCoberturaById(id: number) {
    return this.limiteCapitalPorCobertura.find(l => l.id === id);
  }

  calcularValorCobertura(limitePorCobertura: LimiteCapitalPorCobertura) {
    if (limitePorCobertura.porcentagem) {
      // @ts-ignore
      let result = this.getAtributosForm().valorEscolhido.value * limitePorCobertura.porcentagem;
      // @ts-ignore
      return result > limitePorCobertura.valorMaximo ? limitePorCobertura.valorMaximo : result;
    } else {
      // @ts-ignore
      return limitePorCobertura.valorFixo;
    }

  }

  getAgravo() {
    return this.getAtributosForm().tipoAssociado.value.agravo;
  }

  getValorMaximoPermitido() {
    let valorMaximoPermitido = this.getAtributosForm().tipoAssociado.value.limiteCapital;
    const profissao = this.getAtributosForm().profissao.value;
    let limitePorIdade = this.getLimitePorIdade();
    // @ts-ignore
    if (valorMaximoPermitido > limitePorIdade.seguroMorte) {
      // @ts-ignore
      valorMaximoPermitido = limitePorIdade.seguroMorte;
    } else if (valorMaximoPermitido > profissao.limiteCapital) {
      valorMaximoPermitido = profissao.limiteCapital;
    }

    return valorMaximoPermitido;
  }

  getLimitePorIdade() {
    return this.limitesPorIdade.find(l => l.idade === this.getIdadePorDataDeNascimento());
  }

  getTituloAlerta(tipo: string) {
    switch (tipo) {
      case 'error':
        return 'Error';
      case 'success':
        return 'Sucesso';
      case 'info':
        return 'Informação';
      case 'warning':
        return 'Alerta';
      default:
        throw new Error('O tipo informado não existe.');
    }
  }

  getAtributosForm() {
    return this.cotacaoForm.controls;
  }

  marcarCobertura(idCobertura: number) {
    let co = this.contrato.coberturaOpcional.find(c => c.id === idCobertura);

    // @ts-ignore
    let status = this.cotacaoForm.get(co.rotulo).value;

    this.contrato.coberturaOpcional.forEach(cobertura => {
      // @ts-ignore
      if (this.isGrupoDoencas(co.id) && cobertura.id !== co.id &&
        this.isGrupoDoencas(cobertura.id)) {
        cobertura.desabilitar = !!status;
      }
      // @ts-ignore
      if (this.isDecessos(co.id) && cobertura.id !== co.id && this.isDecessos(cobertura.id)) {
        cobertura.desabilitar = !!status;
      }
    });
  }

  auth(valor: boolean) {
    this.autenticado = valor;
  }

  isDecessos(id: number) {
    return id === 9 || id === 10;
  }

  isGrupoDoencas(id: number) {
    return id === 11 || id === 12 || id === 13;
  }

  getCoberturasOpcionais() {
    let coberturasOpcionais = new Array<Cobertura>();
    coberturasOpcionais.push(new Cobertura(6, 'coberturaIpa', 'IPA',
      0, 0, 0, false, false));
    coberturasOpcionais.push(new Cobertura(7, 'coberturaIfc', 'IFC',
      0, 0, 0, false, false));
    coberturasOpcionais.push(new Cobertura(8, 'coberturaIff', 'IFF',
      0, 0, 0, false, false));
    coberturasOpcionais.push(new Cobertura(9, 'coberturaDecessosIndividual', 'Decessos Individual (DE-I)',
      0, 0, 0, false, false));
    coberturasOpcionais.push(new Cobertura(10, 'coberturaDecessosFamilia', 'Decessos Família (DE-F)',
      0, 0, 0, false, false));
    coberturasOpcionais.push(new Cobertura(11, 'coberturaIfpd', 'IFPD',
      0, 0, 0, false, false));
    coberturasOpcionais.push(new Cobertura(12, 'coberturaDoencasGraves', 'Doenças Graves (DG)',
      0, 0, 0, false, false));
    coberturasOpcionais.push(new Cobertura(13, 'coberturaCancer', 'Câncer (DC)',
      0, 0, 0, false, false));

    return coberturasOpcionais;
  }

  getCoberturasBasicas() {
    let coberturasBasicas = new Array<Cobertura>();
    coberturasBasicas.push(new Cobertura(1, 'coberturaMorte', 'Morte (MN)',
      0, 0, 0, true, false));
    coberturasBasicas.push(new Cobertura(2, 'coberturaMorteAcidental', 'Morte Acidental (MN)',
      0, 0, 0, true, false));
    coberturasBasicas.push(new Cobertura(3, 'coberturaMorteArmaDeFogo', 'MA-AF',
      0, 0, 0, true, false));
    coberturasBasicas.push(new Cobertura(4, 'coberturaInventario', 'Inventário (DI-M)',
      0, 0, 0, true, false));
    coberturasBasicas.push(new Cobertura(5, 'auxilioAlimentacaoPorMorte', 'Auxílio Alimentação por Morte (AAM)',
      0, 0, 0, true, false));

    return coberturasBasicas;
  }
}
